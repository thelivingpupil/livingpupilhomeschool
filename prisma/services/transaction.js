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
  purchaseId
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
      source: description,
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
) =>
  await prisma.transaction.update({
    data: {
      paymentReference,
      paymentStatus,
      message,
    },
    where: { transactionId },
  });
