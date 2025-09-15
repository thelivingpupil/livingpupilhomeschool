import { TransactionSource } from '@prisma/client';
import sanityClient from '@/lib/server/sanity';
import prisma from '@/prisma/index';
import crypto from 'crypto';

export const getPurchaseHistory = async (userId) =>
  await prisma.purchaseHistory.findMany({
    orderBy: [{ createdAt: 'desc' }],
    select: {
      id: true,
      transactionId: true,
      total: true,
      createdAt: true,
      orderItems: {
        select: {
          code: true,
          name: true,
          image: true,
          basePrice: true,
          totalPrice: true,
          quantity: true,
          remarks: true,
        },
      },
      transaction: {
        select: {
          amount: true,
          currency: true,
          referenceNumber: true,
          transactionStatus: true,
          paymentStatus: true,
          source: true,
          paymentReference: true,
          description: true,
          message: true,
          url: true,
          user: {
            select: {
              name: true,
              email: true,
              guardianInformation: {
                select: {
                  primaryGuardianName: true,
                },
              },
            },
          },
          orderFee: {
            select: {
              order: true,
            },
          },
        },
      },
    },
    where: {
      deletedAt: null,
      transaction: {
        source: TransactionSource.STORE,
        deletedAt: null,
        userId,
        orderFee: null,
      },
    },
  });

export const getStorePurchases = async () =>
  await prisma.purchaseHistory.findMany({
    orderBy: [{ createdAt: 'desc' }],
    select: {
      id: true,
      transactionId: true,
      total: true,
      deliveryAddress: true,
      shippingType: true,
      contactNumber: true,
      createdAt: true,
      orderItems: {
        select: {
          code: true,
          name: true,
          image: true,
          basePrice: true,
          totalPrice: true,
          quantity: true,
          remarks: true,
        },
      },
      transaction: {
        select: {
          transactionId: true,
          amount: true,
          currency: true,
          referenceNumber: true,
          transactionStatus: true,
          paymentStatus: true,
          source: true,
          paymentReference: true,
          description: true,
          message: true,
          url: true,
          user: {
            select: {
              name: true,
              email: true,
              guardianInformation: {
                select: {
                  primaryGuardianName: true,
                  secondaryGuardianName: true,
                  address1: true,
                  address2: true,
                  mobileNumber: true,
                  telephoneNumber: true,
                },
              },
            },
          },
          orderFee: {
            select: {
              order: true,
            },
          },
        },
      },
    },
    where: {
      deletedAt: null,
      shippingType: {
        not: null,
      },
      transaction: {
        source: TransactionSource.STORE,
        deletedAt: null,
        orderFee: null,
      },
    },
  });

export const createPurchase = async ({
  items,
  shippingFee,
  deliveryAddress,
  contactNumber,
}) => {
  try {
    // Fetch current inventory
    const itemIds = items.map((item) => item.id);
    const currentInventory = await sanityClient.fetch(
      `*[_type == "shopItems" && _id in $itemIds]`,
      { itemIds }
    );

    // Check and prepare inventory updates
    const inventoryIssues = items
      .map((purchasedItem) => {
        const inventoryItem = currentInventory.find(
          (item) => item._id === purchasedItem.id
        );
        if (inventoryItem) {
          const newQuantity = inventoryItem.inventory - purchasedItem.quantity;
          if (newQuantity < 0) {
            return {
              name: inventoryItem.name,
              id: inventoryItem._id,
              requestedQuantity: purchasedItem.quantity,
              availableQuantity: inventoryItem.inventory,
            };
          }
        }
        return null;
      })
      .filter(Boolean);

    console.log(inventoryIssues);

    // Return errors if any inventory issues
    if (inventoryIssues.length > 0) {
      const errorMessage = inventoryIssues
        .map(
          (item) =>
            `Insufficient inventory for item "${item.name}". Requested: ${item.requestedQuantity}, Available: ${item.availableQuantity}`
        )
        .join(', ');
      return { errors: { error: { msg: errorMessage } } };
    }

    // Proceed with inventory updates if no issues
    const inventoryUpdates = items
      .map((purchasedItem) => {
        const inventoryItem = currentInventory.find(
          (item) => item._id === purchasedItem.id
        );
        if (inventoryItem) {
          const newQuantity = inventoryItem.inventory - purchasedItem.quantity;
          return {
            id: inventoryItem._id,
            patch: {
              set: { inventory: newQuantity },
            },
          };
        }
        return null;
      })
      .filter(Boolean);

    // Batch update inventory
    const transaction = sanityClient.transaction();
    inventoryUpdates.forEach((update) =>
      transaction.patch(update.id, update.patch)
    );

    const result = await transaction.commit();

    // Create purchase history
    const orderItems = items.map(({ code, image, name, price, quantity }) => ({
      code:
        code ||
        `CODE-${crypto
          .createHash('md5')
          .update(name)
          .digest('hex')
          .substring(0, 6)
          .toUpperCase()}`,
      name,
      image,
      basePrice: price,
      totalPrice: Number(price * quantity).toFixed(2),
      quantity,
    }));

    const total =
      items.reduce((a, { price, quantity }) => a + price * quantity, 0) +
      shippingFee?.fee;

    const purchase = await prisma.purchaseHistory.create({
      data: {
        total,
        shippingType: shippingFee?.key,
        deliveryAddress,
        contactNumber,
        orderItems: { create: orderItems },
      },
      select: {
        id: true,
        transactionId: true,
        total: true,
      },
    });

    return purchase;
  } catch (error) {
    console.error('Error creating purchase:', error);
    return {
      errors: {
        error: { msg: 'An error occurred while processing your purchase.' },
      },
    };
  }
};
