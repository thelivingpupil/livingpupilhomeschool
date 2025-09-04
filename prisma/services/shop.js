import { TransactionSource } from '@prisma/client';
import sanityClient from '@/lib/server/sanity';
import prisma from '@/prisma/index';
import crypto from 'crypto';
import { createTransaction } from './transaction';

//get all order fees from shop
export const getStoreOrders = async () =>
  await prisma.orderFee.findMany({
    orderBy: [{ updatedAt: 'desc' }],
    select: {
      id: true,
      userId: true,
      transactionId: true,
      order: true,
      paymentType: true,
      orderCode: true,
      createdAt: true,
      deletedAt: true,
      orderStatus: true,
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
          paymentProofLink: true,
          purchaseHistory: {
            select: {
              id: true,
              total: true,
              createdAt: true,
              shippingType: true,
              deliveryAddress: true,
              contactNumber: true,
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
            },
          },
        },
      },
    },
    where: {
      deletedAt: null,
    },
  });

//get userorder fees from shop
export const getUserOrderFees = async (id) =>
  await prisma.user.findUnique({
    select: {
      email: true,
      name: true,
      userCode: true,
      orderFee: {
        select: {
          order: true,
          paymentType: true,
          deletedAt: true,
          orderCode: true,
          orderStatus: true,
          createdAt: true,
          deletedAt: true,
          transaction: {
            select: {
              transactionId: true,
              transactionStatus: true,
              amount: true,
              paymentReference: true,
              paymentStatus: true,
              message: true,
              referenceNumber: true,
              url: true,
              updatedAt: true,
              purchaseHistory: {
                select: {
                  id: true,
                  total: true,
                  createdAt: true,
                  shippingType: true,
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
                },
              },
            },
          },
        },
        where: {
          deletedAt: null, // Filter out orderFees where deletedAt is not null
        },
        orderBy: [{ createdAt: 'desc' }],
      },
    },
    where: { id },
  });

export const createOrderFee = async ({
  email,
  userId,
  items,
  shippingFee,
  deliveryAddress,
  contactNumber,
  paymentType,
  payments,
  signatureLink,
}) => {
  let result = null;
  // Step 1: Fetch current inventory
  const itemIds = items.map((item) => item.id);
  const currentInventory = await sanityClient.fetch(
    `*[_type == "shopItems" && _id in $itemIds]`,
    { itemIds }
  );
  console.log(currentInventory);

  // Step 2: Check and prepare inventory updates
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

  // Log the inventory updates to inspect
  console.log('Inventory Updates:', JSON.stringify(inventoryUpdates, null, 2));

  // Step 3: Batch update inventory
  try {
    const transaction = sanityClient.transaction();
    inventoryUpdates.forEach((update) => {
      transaction.patch(update.id, update.patch);
    });

    const result = await transaction.commit();
    console.log('Batch mutation result:', result);
  } catch (error) {
    console.error('Batch mutation error:', error);
  }

  // Step 4: Create the initial purchase entry (Payment 0)
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

  // Step 5: Create the transactions for each installment payment
  const transactionIds = await Promise.all([
    prisma.purchaseHistory.create({
      data: {
        total: payments[0],
        shippingType: shippingFee?.key,
        deliveryAddress,
        contactNumber,
        orderItems: { create: orderItems },
        code: orderItems.code,
      },
      select: { id: true, transactionId: true },
    }),
    prisma.purchaseHistory.create({
      data: { total: payments[1] }, // Removed +20 gateway fee
      select: { id: true, transactionId: true },
    }),
    prisma.purchaseHistory.create({
      data: { total: payments[2] }, // Removed +20 gateway fee
      select: { id: true, transactionId: true },
    }),
    prisma.purchaseHistory.create({
      data: { total: payments[3] }, // Removed +20 gateway fee
      select: { id: true, transactionId: true },
    }),
    prisma.purchaseHistory.create({
      data: { total: payments[4] }, // Removed +20 gateway fee
      select: { id: true, transactionId: true },
    }),
  ]);
  const [response] = await Promise.all([
    createTransaction(
      userId,
      email,
      transactionIds[0].transactionId,
      payments[0],
      'STORE',
      transactionIds[0].id,
      TransactionSource.STORE,
      'ONLINE'
    ),
    createTransaction(
      userId,
      email,
      transactionIds[1].transactionId,
      payments[1],
      'STORE',
      transactionIds[1].id,
      TransactionSource.STORE,
      'ONLINE'
    ),
    createTransaction(
      userId,
      email,
      transactionIds[2].transactionId,
      payments[2],
      'STORE',
      transactionIds[2].id,
      TransactionSource.STORE,
      'ONLINE'
    ),
    createTransaction(
      userId,
      email,
      transactionIds[3].transactionId,
      payments[3],
      'STORE',
      transactionIds[3].id,
      TransactionSource.STORE,
      'ONLINE'
    ),
    createTransaction(
      userId,
      email,
      transactionIds[4].transactionId,
      payments[4],
      'STORE',
      transactionIds[4].id,
      TransactionSource.STORE,
      'ONLINE'
    ),
  ]);

  // Function to generate a unique order code
  async function generateUniqueOrderCode(prisma) {
    let uniqueOrderCode;
    let isUnique = false;

    while (!isUnique) {
      // Generate the order code
      uniqueOrderCode = `ORDER-${crypto
        .createHash('md5')
        .update(Date.now().toString() + Math.random().toString())
        .digest('hex')
        .substring(0, 6)
        .toUpperCase()}`;

      // Check if the code already exists in the database
      const existingOrder = await prisma.orderFee.findFirst({
        where: { orderCode: uniqueOrderCode },
      });

      // If no existing order found, the code is unique
      if (!existingOrder) {
        isUnique = true;
      }
    }

    return uniqueOrderCode;
  }

  // Generate the unique order code
  const uniqueOrderCode = await generateUniqueOrderCode(prisma);

  await Promise.all([
    prisma.orderFee.create({
      data: {
        order: 0,
        paymentType,
        orderCode: uniqueOrderCode,
        signatureLink: signatureLink,
        transaction: {
          connect: {
            transactionId: transactionIds[0].transactionId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    }),
    prisma.orderFee.create({
      data: {
        order: 1,
        paymentType,
        orderCode: uniqueOrderCode,
        signatureLink: signatureLink,
        transaction: {
          connect: {
            transactionId: transactionIds[1].transactionId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    }),
    prisma.orderFee.create({
      data: {
        order: 2,
        paymentType,
        orderCode: uniqueOrderCode,
        signatureLink: signatureLink,
        transaction: {
          connect: {
            transactionId: transactionIds[2].transactionId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    }),
    prisma.orderFee.create({
      data: {
        order: 3,
        paymentType,
        orderCode: uniqueOrderCode,
        signatureLink: signatureLink,
        transaction: {
          connect: {
            transactionId: transactionIds[3].transactionId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    }),
    prisma.orderFee.create({
      data: {
        order: 4,
        paymentType,
        orderCode: uniqueOrderCode,
        signatureLink: signatureLink,
        transaction: {
          connect: {
            transactionId: transactionIds[4].transactionId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    }),
  ]);
  result = response;

  return {
    paymentLink: result?.url,
    orderCode: uniqueOrderCode,
  };
};

export const cancelOrder = async (orderCode) => {
  try {
    const updatedOrder = await prisma.orderFee.updateMany({
      where: { orderCode },
      data: { orderStatus: 'Cancelled' },
    });
    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return { success: false, error: 'Failed to update order status.' };
  }
};
