import { Currency } from '@prisma/client';

import api from '@/lib/common/api';
import { getBasicAuthorization } from '@/lib/server/dragonpay';
import prisma from '@/prisma/index';

export const createTransaction = async (
  userId,
  email,
  transactionId,
  amount,
  description,
  purchaseId,
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
  await prisma.transaction.create({
    data: {
      transactionId,
      referenceNumber,
      amount,
      transactionStatus,
      source: source || description,
      description,
      message,
      url,
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
  return url;
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
