import {
  Currency,
  Fees,
  OrderV2Status,
  PaymentType,
  ShopPaymentType,
  TransactionSource,
  TransactionStatus,
} from '@prisma/client';
import { add } from 'date-fns';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import api from '@/lib/common/api';
import { getBasicAuthorization } from '@/lib/server/dragonpay';
import prisma from '@/prisma/index';
import {
  commitReservedShopOrder,
  releaseReservedShopOrder,
  reserveShopOrderInventory,
} from '@/prisma/services/inventory';

const DUPLICATE_ORDER_WINDOW_MS = 5 * 60 * 1000;

const buildItemFingerprint = (items, keyFn) =>
  items
    .map((item) => `${keyFn(item)}:${item.quantity}`)
    .sort()
    .join('|');

const mapShopPaymentType = (paymentType) =>
  paymentType === 'INSTALLMENT'
    ? ShopPaymentType.INSTALLMENT
    : ShopPaymentType.FULL_PAYMENT;

const mapTransactionPaymentType = (paymentType) =>
  paymentType === 'INSTALLMENT' ? PaymentType.MONTHLY : PaymentType.PAY_ALL;

const generateUniqueOrderCode = async () => {
  let uniqueOrderCode;
  let isUnique = false;

  while (!isUnique) {
    uniqueOrderCode = `ORDER-${crypto
      .createHash('md5')
      .update(Date.now().toString() + Math.random().toString())
      .digest('hex')
      .substring(0, 6)
      .toUpperCase()}`;

    const existing = await prisma.orderV2.findUnique({
      where: { orderCode: uniqueOrderCode },
      select: { orderId: true },
    });

    if (!existing) {
      isUnique = true;
    }
  }

  return uniqueOrderCode;
};

export const createTransactionV2 = async ({
  userId,
  email,
  amount,
  description,
  paymentType,
}) => {
  const transactionId = uuidv4();
  const mappedPaymentType = mapTransactionPaymentType(paymentType);

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
  } = response || {};

  if (!referenceNumber || !url) {
    const error = new Error(
      message || 'Failed to create payment transaction with gateway'
    );
    error.code = 'PAYMENT_GATEWAY_ERROR';
    throw error;
  }

  await prisma.transactionV2.create({
    data: {
      transactionId,
      referenceNumber,
      amount,
      paymentType: mappedPaymentType,
      transactionStatus: transactionStatus || TransactionStatus.U,
      paymentStatus: TransactionStatus.U,
      source: TransactionSource.STORE,
      description: description || 'STORE',
      message: message || null,
      url: `${url}`,
      fee: Fees.ONLINE,
      userId: userId || null,
    },
  });

  return {
    url: `${url}`,
    referenceNumber,
    transactionId,
    amount: Number(amount),
  };
};

export const findRecentDuplicateOrderV2 = async ({
  userId,
  items,
  deliveryAddress,
  contactNumber,
  paymentType,
  totalAmount,
  skipTotalCheck = false,
}) => {
  const windowStart = new Date(Date.now() - DUPLICATE_ORDER_WINDOW_MS);
  const shopPaymentType = mapShopPaymentType(paymentType);
  const newFingerprint = buildItemFingerprint(items, (item) => item.name);

  const recentOrders = await prisma.orderV2.findMany({
    where: {
      userId,
      deletedAt: null,
      paymentType: shopPaymentType,
      status: OrderV2Status.ORDER_PLACED,
      createdAt: { gte: windowStart },
    },
    include: {
      orderItems: {
        select: { name: true, quantity: true },
      },
      orderFees: {
        where: { installment: 0 },
        include: {
          transaction: {
            select: {
              transactionId: true,
              url: true,
              amount: true,
            },
          },
        },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  for (const order of recentOrders) {
    if (order.deliveryAddress !== deliveryAddress) continue;
    if (order.contactNumber !== contactNumber) continue;
    if (!skipTotalCheck && Number(order.total) !== Number(totalAmount)) {
      continue;
    }

    const existingFingerprint = buildItemFingerprint(
      order.orderItems,
      (item) => item.name
    );
    if (existingFingerprint !== newFingerprint) continue;

    const firstFee = order.orderFees[0];
    if (!firstFee?.transaction) continue;

    return {
      orderCode: order.orderCode,
      transactionId: firstFee.transaction.transactionId,
      paymentLink: firstFee.transaction.url,
      amount: Number(firstFee.transaction.amount),
    };
  }

  return null;
};

export const createShopOrderV2 = async ({
  userId,
  email,
  items,
  shippingFee,
  deliveryAddress,
  contactNumber,
  paymentType,
  signatureLink,
  payments,
}) => {
  const shopPaymentType = mapShopPaymentType(paymentType);
  const orderCode = await generateUniqueOrderCode();
  const total = Number(
    items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) +
      (Number(shippingFee?.fee) || 0)
  );

  let createdOrder;

  try {
    createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.orderV2.create({
        data: {
          orderCode,
          total,
          deliveryAddress: deliveryAddress || null,
          shippingType: shippingFee?.key || null,
          contactNumber: contactNumber || null,
          paymentType: shopPaymentType,
          status: OrderV2Status.ORDER_PLACED,
          userId,
          orderItems: {
            create: items.map((item) => ({
              code:
                item.code ||
                `CODE-${crypto
                  .createHash('md5')
                  .update(item.name)
                  .digest('hex')
                  .substring(0, 6)
                  .toUpperCase()}`,
              name: item.name,
              image: item.image || '',
              basePrice: item.price,
              totalPrice: Number(item.price * item.quantity).toFixed(2),
              quantity: item.quantity,
              productId: item.id || null,
            })),
          },
        },
        include: { orderItems: true },
      });

      const reserveItems = order.orderItems.map((line) => ({
        id: line.productId,
        quantity: line.quantity,
        name: line.name,
        orderItemId: line.orderItemId,
      }));

      await reserveShopOrderInventory({
        items: reserveItems.filter((item) => item.id),
        userId,
        tx,
      });

      return order;
    });
  } catch (error) {
    if (error.code === 'INSUFFICIENT_INVENTORY') {
      return { errors: { error: { msg: error.message } } };
    }
    throw error;
  }

  const createdFees = [];

  try {
    for (let i = 0; i < payments.length; i += 1) {
      const txn = await createTransactionV2({
        userId,
        email,
        amount: payments[i],
        description: 'STORE',
        paymentType,
      });

      await prisma.orderFeeV2.create({
        data: {
          installment: i,
          signatureLink: signatureLink || null,
          status: OrderV2Status.ORDER_PLACED,
          orderId: createdOrder.orderId,
          transactionId: txn.transactionId,
        },
      });

      createdFees.push(txn);
    }
  } catch (error) {
    console.error('Shop V2 payment creation failed, releasing reserve:', error);
    try {
      await releaseReservedShopOrder({
        orderId: createdOrder.orderId,
        userId,
      });
      await prisma.orderV2.update({
        where: { orderId: createdOrder.orderId },
        data: { status: OrderV2Status.CANCELLED },
      });
    } catch (releaseError) {
      console.error('Failed to release after payment error:', releaseError);
    }

    return {
      errors: {
        error: {
          msg: error.message || 'Failed to create shop payment',
        },
      },
    };
  }

  const first = createdFees[0];

  return {
    paymentLink: first?.url,
    orderCode,
    transactionId: first?.transactionId,
    amount: first?.amount ?? payments[0],
    totalPayment: payments.reduce((sum, value) => sum + Number(value), 0),
    payments,
  };
};

export const cancelShopOrderV2 = async ({
  orderCode,
  userId,
  enforceOwner = false,
}) => {
  const order = await prisma.orderV2.findUnique({
    where: { orderCode },
    include: {
      orderItems: true,
      orderFees: {
        include: {
          transaction: {
            select: { paymentStatus: true, transactionId: true },
          },
        },
        orderBy: { installment: 'asc' },
      },
    },
  });

  if (!order) {
    const error = new Error('Order not found');
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  if (enforceOwner && order.userId !== userId) {
    const error = new Error('Forbidden');
    error.code = 'FORBIDDEN';
    throw error;
  }

  if (order.status === OrderV2Status.CANCELLED) {
    return { success: true, alreadyCancelled: true };
  }

  // Parents may only cancel before first payment succeeds
  if (enforceOwner) {
    const firstFee = order.orderFees?.[0];
    const firstPaid =
      firstFee?.transaction?.paymentStatus === 'S' ||
      firstFee?.transaction?.paymentStatus === TransactionStatus.S;
    if (firstPaid) {
      const error = new Error(
        'This order can no longer be cancelled online. Please contact Living Pupil Homeschool for assistance.'
      );
      error.code = 'ALREADY_PAID';
      throw error;
    }
  }

  await releaseReservedShopOrder({
    orderId: order.orderId,
    userId,
  });

  await prisma.$transaction([
    prisma.orderV2.update({
      where: { orderId: order.orderId },
      data: {
        status: OrderV2Status.CANCELLED,
        cancelRequestedAt: null,
        cancelReason: null,
      },
    }),
    prisma.orderFeeV2.updateMany({
      where: { orderId: order.orderId },
      data: { status: OrderV2Status.CANCELLED },
    }),
  ]);

  return { success: true };
};

export const requestCancelShopOrderV2 = async ({
  orderCode,
  userId,
  reason,
}) => {
  const trimmedReason = (reason || '').trim();
  if (!trimmedReason) {
    const error = new Error('Cancellation reason is required');
    error.code = 'REASON_REQUIRED';
    throw error;
  }

  const order = await prisma.orderV2.findUnique({
    where: { orderCode },
    include: {
      orderFees: {
        include: {
          transaction: {
            select: { paymentStatus: true },
          },
        },
        orderBy: { installment: 'asc' },
      },
    },
  });

  if (!order) {
    const error = new Error('Order not found');
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  if (order.userId !== userId) {
    const error = new Error('Forbidden');
    error.code = 'FORBIDDEN';
    throw error;
  }

  if (order.status === OrderV2Status.CANCELLED) {
    const error = new Error('Order is already cancelled');
    error.code = 'ORDER_CANCELLED';
    throw error;
  }

  if (order.cancelRequestedAt) {
    const error = new Error('A cancellation request is already pending');
    error.code = 'REQUEST_EXISTS';
    throw error;
  }

  const firstFee = order.orderFees?.[0];
  const firstPaid =
    firstFee?.transaction?.paymentStatus === 'S' ||
    firstFee?.transaction?.paymentStatus === TransactionStatus.S;
  if (firstPaid) {
    const error = new Error(
      'This order can no longer be cancelled online. Please contact Living Pupil Homeschool for assistance.'
    );
    error.code = 'ALREADY_PAID';
    throw error;
  }

  await prisma.orderV2.update({
    where: { orderId: order.orderId },
    data: {
      cancelRequestedAt: new Date(),
      cancelReason: trimmedReason,
    },
  });

  return { success: true };
};

export const rejectCancelShopOrderV2 = async ({ orderCode }) => {
  const order = await prisma.orderV2.findUnique({
    where: { orderCode },
  });

  if (!order) {
    const error = new Error('Order not found');
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  if (!order.cancelRequestedAt) {
    const error = new Error('No cancellation request pending');
    error.code = 'NO_REQUEST';
    throw error;
  }

  await prisma.orderV2.update({
    where: { orderId: order.orderId },
    data: {
      cancelRequestedAt: null,
      cancelReason: null,
    },
  });

  return { success: true };
};

export const approveCancelShopOrderV2 = async ({ orderCode, userId }) => {
  const order = await prisma.orderV2.findUnique({
    where: { orderCode },
  });

  if (!order) {
    const error = new Error('Order not found');
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  if (!order.cancelRequestedAt) {
    const error = new Error('No cancellation request pending');
    error.code = 'NO_REQUEST';
    throw error;
  }

  return cancelShopOrderV2({ orderCode, userId, enforceOwner: false });
};

const shopOrderV2Include = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      guardianInformation: {
        select: {
          primaryGuardianName: true,
          mobileNumber: true,
        },
      },
    },
  },
  orderItems: true,
  orderFees: {
    include: {
      transaction: {
        select: {
          transactionId: true,
          amount: true,
          paymentStatus: true,
          transactionStatus: true,
          url: true,
          paymentProofLink: true,
          referenceNumber: true,
          paymentReference: true,
          description: true,
          createdAt: true,
        },
      },
    },
    orderBy: { installment: 'asc' },
  },
};

export const getShopOrdersV2 = async () =>
  prisma.orderV2.findMany({
    where: { deletedAt: null },
    include: shopOrderV2Include,
    orderBy: { createdAt: 'desc' },
  });

export const getShopOrderV2ByCode = async (orderCode) => {
  if (!orderCode) return null;
  return prisma.orderV2.findFirst({
    where: { orderCode, deletedAt: null },
    include: shopOrderV2Include,
  });
};

export const isOrderPaidEnough = (order) =>
  (order?.orderFees || []).some(
    (fee) =>
      fee.transaction?.paymentStatus === 'S' ||
      fee.transaction?.paymentStatus === TransactionStatus.S
  );

/** Map OrderV2Status → legacy parent Purchase History status keys */
const mapOrderV2StatusToLegacy = (status) => {
  switch (status) {
    case OrderV2Status.ORDER_PLACED:
      return 'Order_Placed';
    case OrderV2Status.PROCESSING:
      return 'Processing';
    case OrderV2Status.SHIPPED:
      return 'For_Delivery';
    case OrderV2Status.COMPLETED:
      return 'Completed';
    case OrderV2Status.CANCELLED:
      return 'Cancelled';
    default:
      return 'Order_Placed';
  }
};

const toNumber = (value) =>
  value && typeof value.toNumber === 'function' ? value.toNumber() : Number(value || 0);

/**
 * Flatten a parent's OrderV2 rows into the legacy OrderFee shape used by
 * /account/purchase-history so the NEW Purchases tab can render V2 orders.
 */
export const getUserShopOrdersV2AsLegacyFees = async (userId) => {
  const orders = await prisma.orderV2.findMany({
    where: { userId, deletedAt: null },
    include: {
      orderItems: true,
      orderFees: {
        where: { deletedAt: null },
        include: {
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
              paymentProofLink: true,
              updatedAt: true,
              createdAt: true,
            },
          },
        },
        orderBy: { installment: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders.flatMap((order) => {
    const orderItems = (order.orderItems || []).map((item) => ({
      code: item.code,
      name: item.name,
      image: item.image,
      basePrice: toNumber(item.basePrice),
      totalPrice: toNumber(item.totalPrice),
      quantity: item.quantity,
      remarks: item.remarks,
    }));

    const legacyStatus = mapOrderV2StatusToLegacy(order.status);

    return (order.orderFees || []).map((fee) => ({
      order: fee.installment,
      paymentType: order.paymentType,
      orderCode: order.orderCode,
      orderStatus: legacyStatus,
      orderSource: 'V2',
      cancelRequestedAt: order.cancelRequestedAt,
      cancelReason: order.cancelReason,
      createdAt: fee.createdAt || order.createdAt,
      deletedAt: null,
      transaction: {
        transactionId: fee.transaction?.transactionId,
        transactionStatus: fee.transaction?.transactionStatus,
        amount: toNumber(fee.transaction?.amount),
        paymentReference: fee.transaction?.paymentReference,
        paymentStatus: fee.transaction?.paymentStatus,
        message: fee.transaction?.message,
        referenceNumber: fee.transaction?.referenceNumber,
        url: fee.transaction?.url,
        paymentProofLink: fee.transaction?.paymentProofLink,
        updatedAt: fee.transaction?.updatedAt,
        purchaseHistory: {
          id: order.orderId,
          total: toNumber(order.total),
          createdAt: order.createdAt,
          shippingType: order.shippingType,
          deliveryAddress: order.deliveryAddress,
          contactNumber: order.contactNumber,
          orderItems,
        },
      },
    }));
  });
};

export const updateShopOrderV2Status = async ({ orderCode, status }) => {
  const allowed = Object.values(OrderV2Status);
  if (!allowed.includes(status)) {
    const error = new Error('Invalid order status');
    error.code = 'INVALID_STATUS';
    throw error;
  }

  if (status === OrderV2Status.CANCELLED) {
    const error = new Error('Use cancel for CANCELLED status');
    error.code = 'USE_CANCEL';
    throw error;
  }

  const order = await prisma.orderV2.findUnique({
    where: { orderCode },
  });

  if (!order) {
    const error = new Error('Order not found');
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  if (order.status === OrderV2Status.CANCELLED) {
    const error = new Error('Cannot update a cancelled order');
    error.code = 'ORDER_CANCELLED';
    throw error;
  }

  await prisma.$transaction([
    prisma.orderV2.update({
      where: { orderId: order.orderId },
      data: { status },
    }),
    prisma.orderFeeV2.updateMany({
      where: { orderId: order.orderId },
      data: { status },
    }),
  ]);

  return { success: true };
};

export const commitShopOrderOnFirstPayment = async (transactionId) => {
  const fee = await prisma.orderFeeV2.findUnique({
    where: { transactionId },
    include: {
      transaction: true,
      order: true,
    },
  });

  if (!fee || fee.installment !== 0) {
    return null;
  }

  if (fee.transaction?.source !== TransactionSource.STORE) {
    return null;
  }

  await commitReservedShopOrder({
    orderId: fee.orderId,
    userId: fee.order?.userId,
  });

  return fee.orderId;
};
