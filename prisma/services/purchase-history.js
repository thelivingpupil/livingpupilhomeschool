import { TransactionSource, TransactionStatus } from '@prisma/client';
import prisma from '@/prisma/index';

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
        },
      },
    },
    where: {
      deletedAt: null,
      transaction: {
        source: TransactionSource.STORE,
        deletedAt: null,
        userId,
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
        },
      },
    },
    where: {
      deletedAt: null,
      transaction: {
        source: TransactionSource.STORE,
        deletedAt: null,
        paymentStatus: {
          not: TransactionStatus.U,
        },
      },
    },
  });

export const createPurchase = async (items) => {
  const orderItems = items.map(({ code, image, name, price, quantity }) => ({
    code,
    name,
    image,
    basePrice: price,
    totalPrice: Number(price * quantity).toFixed(2),
    quantity,
  }));
  const total = items.reduce(
    (a, { price, quantity }) => a + price * quantity,
    0
  );
  return await prisma.purchaseHistory.create({
    data: {
      total,
      orderItems: { create: orderItems },
    },
    select: {
      id: true,
      transactionId: true,
      total: true,
    },
  });
};
