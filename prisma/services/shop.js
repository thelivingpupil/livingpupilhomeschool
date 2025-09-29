import { TransactionSource, ShippingType } from '@prisma/client';
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
      orderStatus: true,
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
  const histories = [
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
      data: { total: payments[1] },
      select: { id: true, transactionId: true },
    }),
    prisma.purchaseHistory.create({
      data: { total: payments[2] },
      select: { id: true, transactionId: true },
    }),
    prisma.purchaseHistory.create({
      data: { total: payments[3] },
      select: { id: true, transactionId: true },
    }),
    prisma.purchaseHistory.create({
      data: { total: payments[4] },
      select: { id: true, transactionId: true },
    }),
  ];

  // Add conditionally if PICK_UP
  if (shippingFee?.key !== ShippingType.PICK_UP) {
    histories.push(
      prisma.purchaseHistory.create({
        data: { total: payments[5] },
        select: { id: true, transactionId: true },
      })
    );
  }

  const transactionIds = await Promise.all(histories);
  const transactionPromises = transactionIds
    .slice(0, 5)
    .map((t, i) =>
      createTransaction(
        userId,
        email,
        t.transactionId,
        payments[i],
        'STORE',
        t.id,
        TransactionSource.STORE,
        'ONLINE'
      )
    );

  // Conditionally add the 6th transaction
  if (shippingFee?.key !== ShippingType.PICK_UP && transactionIds[5]) {
    transactionPromises.push(
      createTransaction(
        userId,
        email,
        transactionIds[5].transactionId,
        payments[5],
        'STORE',
        transactionIds[5].id,
        TransactionSource.STORE,
        'ONLINE'
      )
    );
  }
  const [response] = await Promise.all(transactionPromises);
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

  // Base order fees for the first 5
  const orderFeePromises = transactionIds.slice(0, 5).map((t, i) =>
    prisma.orderFee.create({
      data: {
        order: i,
        paymentType,
        orderCode: uniqueOrderCode,
        orderStatus: 'Order_Placed',
        signatureLink,
        transaction: {
          connect: {
            transactionId: t.transactionId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    })
  );

  // Conditionally add the extra one for PICK_UP
  if (shippingFee?.key !== ShippingType.PICK_UP && transactionIds[5]) {
    orderFeePromises.push(
      prisma.orderFee.create({
        data: {
          order: 5,
          paymentType,
          orderCode: uniqueOrderCode,
          orderStatus: 'Order_Placed',
          signatureLink,
          transaction: {
            connect: {
              transactionId: transactionIds[5].transactionId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      })
    );
  }

  await Promise.all(orderFeePromises);

  result = response;
  return {
    paymentLink: result?.url,
    orderCode: uniqueOrderCode,
    transactionId: result.transactionId, // For first payment only
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

export const updateOrderFeeStatus = async (orderCode, status) => {
  try {
    const updatedOrderFee = await prisma.orderFee.updateMany({
      data: {
        orderStatus: status,
      },
      where: { orderCode },
    });
    return { success: true, data: updatedOrderFee };
  } catch (error) {
    console.log(`Error updating order status: `, error);
    return { success: false, error: 'Failed to update order status.' };
  }
};
