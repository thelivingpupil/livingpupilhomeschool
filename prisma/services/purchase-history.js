import prisma from '@/prisma/index';

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
