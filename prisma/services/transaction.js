import {
  Currency,
  Fees,
  TransactionSource,
  TransactionStatus,
} from '@prisma/client';
import { add } from 'date-fns';

import api from '@/lib/common/api';
import { getBasicAuthorization } from '@/lib/server/dragonpay';
import prisma from '@/prisma/index';

const modes = { [Fees.ONLINE]: 1, [Fees.OTC]: 2, [Fees.PAYMENT_CENTERS]: 4 };

export const getTotalEnrollmentRevenuesByStatus = async (
  startDate,
  endDate
) => {
  const filterDate =
    startDate && endDate
      ? {
          AND: [
            { createdAt: { gte: new Date(startDate) } },
            { createdAt: { lte: new Date(endDate) } },
          ],
        }
      : {};
  const result = await prisma.transaction.groupBy({
    by: ['paymentStatus'],
    where: {
      ...filterDate,
      deletedAt: null,
      source: TransactionSource.ENROLLMENT,
    },
    _sum: { amount: true },
  });
  const data = {
    [TransactionStatus.S]: 0,
    [TransactionStatus.F]: 0,
    [TransactionStatus.P]: 0,
    [TransactionStatus.U]: 0,
    [TransactionStatus.R]: 0,
    [TransactionStatus.K]: 0,
    [TransactionStatus.V]: 0,
    [TransactionStatus.A]: 0,
  };
  result.forEach((status) => {
    data[status.paymentStatus] = status._sum.amount;
  });
  return data;
};

export const getTotalStoreRevenuesByStatus = async (startDate, endDate) => {
  const filterDate =
    startDate && endDate
      ? {
          AND: [
            { createdAt: { gte: new Date(startDate) } },
            { createdAt: { lte: new Date(endDate) } },
          ],
        }
      : {};
  const result = await prisma.transaction.groupBy({
    by: ['paymentStatus'],
    where: {
      ...filterDate,
      deletedAt: null,
      source: TransactionSource.STORE,
    },
    _sum: { amount: true },
  });
  const data = {
    [TransactionStatus.S]: 0,
    [TransactionStatus.F]: 0,
    [TransactionStatus.P]: 0,
    [TransactionStatus.U]: 0,
    [TransactionStatus.R]: 0,
    [TransactionStatus.K]: 0,
    [TransactionStatus.V]: 0,
    [TransactionStatus.A]: 0,
  };
  result.forEach((status) => {
    data[status.paymentStatus] = status._sum.amount;
  });
  return data;
};

export const getTotalSales = async (startDate, endDate) => {
  const filterDate =
    startDate && endDate
      ? {
          AND: [
            { createdAt: { gte: new Date(startDate) } },
            { createdAt: { lte: new Date(endDate) } },
          ],
        }
      : {};
  const total = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      ...filterDate,
      deletedAt: null,
      paymentStatus: TransactionStatus.S,
    },
  });
  return total?._sum.amount || 0;
};

export const getPendingSales = async (startDate, endDate) => {
  const filterDate =
    startDate && endDate
      ? {
          AND: [
            { createdAt: { gte: new Date(startDate) } },
            { createdAt: { lte: new Date(endDate) } },
          ],
        }
      : {};
  const total = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      ...filterDate,
      deletedAt: null,
      NOT: { paymentStatus: TransactionStatus.S },
    },
  });
  return total?._sum.amount || 0;
};

export const cancelTransaction = async (transactionId) => {
  const response = await api(
    `${process.env.PAYMENTS_BASE_URL}/void/${transactionId}`,
    {
      headers: {
        Authorization: `${getBasicAuthorization()}`,
      },
      method: 'GET',
    }
  );
  const { Status: status, Message: message } = response;

  if (status === 0) {
    await prisma.transaction.update({
      data: {
        message,
        transactionStatus: TransactionStatus.V,
      },
      where: { transactionId },
    });
  }
};

export const createTransaction = async (
  userId,
  email,
  transactionId,
  amount,
  description,
  purchaseId,
  source,
  fee = Fees.ONLINE
) => {
  const response = await api(
    `${process.env.PAYMENTS_BASE_URL}/${transactionId}/post`,
    {
      body: {
        Amount: amount,
        Currency: Currency.PHP,
        Description: description,
        Email: email,
        Expiry: add(new Date(), { years: 1 }),
      },
      headers: {
        Authorization: `${getBasicAuthorization()}`,
      },
      method: 'POST',
    }
  );
  const {
    RefNo: referenceNumber,
    Status: transactionStatus,
    Message: message,
    Url: url,
  } = response;
  await prisma.transaction.create({
    data: {
      transactionId,
      referenceNumber,
      amount,
      transactionStatus,
      source: source || description,
      description,
      message,
      url: `${url}&mode=${modes[fee]}`,
      fee,
      user: {
        connect: {
          id: userId,
        },
      },
      purchaseHistory: {
        connect: {
          id: purchaseId,
        },
      },
    },
  });
  return { url: `${url}&mode=${modes[fee]}`, referenceNumber };
};

export const getTransaction = async (transactionId, referenceNumber) =>
  await prisma.transaction.findUnique({
    where: {
      transactionId_referenceNumber: {
        transactionId,
        referenceNumber,
      },
    },
  });

export const getTransactions = async () =>
  await prisma.transaction.findMany({
    orderBy: [{ updatedAt: 'desc' }],
    select: {
      transactionId: true,
      amount: true,
      currency: true,
      paymentStatus: true,
      paymentReference: true,
      createdAt: true,
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
      schoolFee: {
        select: {
          paymentType: true,
          student: {
            select: {
              studentRecord: {
                select: {
                  firstName: true,
                  middleName: true,
                  lastName: true,
                  incomingGradeLevel: true,
                  enrollmentType: true,
                  program: true,
                  accreditation: true,
                },
              },
            },
          },
        },
      },
    },
    where: {
      // paymentStatus: {
      //   not: TransactionStatus.U,
      // },
      deletedAt: null,
      source: TransactionSource.ENROLLMENT,
    },
  });

export const renewTransaction = async (
  email,
  transactionId,
  amount,
  description,
  source
) => {
  const response = await api(
    `${process.env.PAYMENTS_BASE_URL}/${transactionId}/post`,
    {
      body: {
        Amount: amount,
        Currency: Currency.PHP,
        Description: description,
        Email: email,
      },
      headers: {
        Authorization: `${getBasicAuthorization()}`,
      },
      method: 'POST',
    }
  );
  const {
    RefNo: referenceNumber,
    Status: transactionStatus,
    Message: message,
    Url: url,
  } = response;
  await prisma.transaction.update({
    data: {
      referenceNumber,
      amount,
      transactionStatus,
      source: source || description,
      description,
      message,
      url,
    },
    where: { transactionId },
  });
  return { url, referenceNumber };
};

export const updateTransaction = async (
  transactionId,
  paymentReference,
  paymentStatus,
  message
) => {
  const transaction = await prisma.transaction.update({
    data: {
      paymentReference,
      paymentStatus,
      message,
    },
    select: {
      transactionId: true,
      referenceNumber: true,
      amount: true,
      currency: true,
      transactionStatus: true,
      paymentStatus: true,
      source: true,
      paymentReference: true,
      description: true,
      message: true,
      url: true,
      createdAt: true,
    },
    where: { transactionId },
  });

  return {
    ...transaction,
    amount: transaction?.amount?.toNumber() || 0,
    createdAt: transaction?.createdAt?.toDateString(),
  };
};
