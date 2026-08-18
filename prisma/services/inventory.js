import { InventoryMovementType } from '@prisma/client';
import prisma from '@/prisma/index';

export const getInventoryMovements = async ({
  productId,
  type,
  take = 500,
} = {}) =>
  prisma.inventoryMovement.findMany({
    where: {
      ...(productId ? { productId } : {}),
      ...(type ? { type } : {}),
    },
    include: {
      product: {
        select: {
          productId: true,
          code: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take,
  });

export const commitShopOrderInventory = async ({ items, userId }) => {
  return prisma.$transaction(async (tx) => {
    const inventoryIssues = [];

    for (const purchasedItem of items) {
      const inventory = await tx.inventoryItem.findUnique({
        where: { productId: purchasedItem.id },
        include: { product: true },
      });

      if (
        !inventory ||
        !inventory.product ||
        inventory.product.deletedAt ||
        !inventory.product.isActive
      ) {
        inventoryIssues.push({
          name: purchasedItem.name || purchasedItem.id,
          id: purchasedItem.id,
          requestedQuantity: purchasedItem.quantity,
          availableQuantity: 0,
        });
        continue;
      }

      const available = Math.max(
        0,
        inventory.quantityOnHand - inventory.quantityReserved
      );

      if (purchasedItem.quantity > available) {
        inventoryIssues.push({
          name: inventory.product.name,
          id: purchasedItem.id,
          requestedQuantity: purchasedItem.quantity,
          availableQuantity: available,
        });
      }
    }

    if (inventoryIssues.length > 0) {
      const error = new Error(
        inventoryIssues
          .map(
            (item) =>
              `Insufficient inventory for item "${item.name}". Requested: ${item.requestedQuantity}, Available: ${item.availableQuantity}`
          )
          .join(', ')
      );
      error.code = 'INSUFFICIENT_INVENTORY';
      error.inventoryIssues = inventoryIssues;
      throw error;
    }

    for (const purchasedItem of items) {
      const inventory = await tx.inventoryItem.update({
        where: { productId: purchasedItem.id },
        data: {
          quantityOnHand: { decrement: purchasedItem.quantity },
        },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: inventory.inventoryItemId,
          productId: purchasedItem.id,
          userId: userId || null,
          type: InventoryMovementType.COMMIT,
          quantity: purchasedItem.quantity,
          reason: 'Shop order',
        },
      });
    }
  });
};

/**
 * items: [{ id: productId, quantity, name?, orderItemId? }]
 * Optional `tx` to run inside an existing interactive transaction.
 */
export const reserveShopOrderInventory = async ({
  items,
  userId,
  tx: outerTx,
}) => {
  const run = async (tx) => {
    const inventoryIssues = [];

    for (const purchasedItem of items) {
      const inventory = await tx.inventoryItem.findUnique({
        where: { productId: purchasedItem.id },
        include: { product: true },
      });

      if (
        !inventory ||
        !inventory.product ||
        inventory.product.deletedAt ||
        !inventory.product.isActive
      ) {
        inventoryIssues.push({
          name: purchasedItem.name || purchasedItem.id,
          id: purchasedItem.id,
          requestedQuantity: purchasedItem.quantity,
          availableQuantity: 0,
        });
        continue;
      }

      const available = Math.max(
        0,
        inventory.quantityOnHand - inventory.quantityReserved
      );

      if (purchasedItem.quantity > available) {
        inventoryIssues.push({
          name: inventory.product.name,
          id: purchasedItem.id,
          requestedQuantity: purchasedItem.quantity,
          availableQuantity: available,
        });
      }
    }

    if (inventoryIssues.length > 0) {
      const error = new Error(
        inventoryIssues
          .map(
            (item) =>
              `Insufficient inventory for item "${item.name}". Requested: ${item.requestedQuantity}, Available: ${item.availableQuantity}`
          )
          .join(', ')
      );
      error.code = 'INSUFFICIENT_INVENTORY';
      error.inventoryIssues = inventoryIssues;
      throw error;
    }

    for (const purchasedItem of items) {
      const inventory = await tx.inventoryItem.update({
        where: { productId: purchasedItem.id },
        data: {
          quantityReserved: { increment: purchasedItem.quantity },
        },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: inventory.inventoryItemId,
          productId: purchasedItem.id,
          orderItemId: purchasedItem.orderItemId || null,
          userId: userId || null,
          type: InventoryMovementType.RESERVE,
          quantity: purchasedItem.quantity,
          reason: 'Shop order reserved',
        },
      });
    }
  };

  if (outerTx) {
    return run(outerTx);
  }

  return prisma.$transaction(run);
};

export const commitReservedShopOrder = async ({ orderId, userId }) => {
  return prisma.$transaction(async (tx) => {
    const orderItems = await tx.orderItemV2.findMany({
      where: { orderId, deletedAt: null },
    });

    for (const line of orderItems) {
      if (!line.productId || line.quantity <= 0) {
        continue;
      }

      const alreadyCommitted = await tx.inventoryMovement.findFirst({
        where: {
          orderItemId: line.orderItemId,
          type: InventoryMovementType.COMMIT,
        },
      });

      if (alreadyCommitted) {
        continue;
      }

      const inventory = await tx.inventoryItem.findUnique({
        where: { productId: line.productId },
      });

      if (!inventory) {
        continue;
      }

      await tx.inventoryItem.update({
        where: { productId: line.productId },
        data: {
          quantityOnHand: { decrement: line.quantity },
          quantityReserved: { decrement: line.quantity },
        },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: inventory.inventoryItemId,
          productId: line.productId,
          orderItemId: line.orderItemId,
          userId: userId || null,
          type: InventoryMovementType.COMMIT,
          quantity: line.quantity,
          reason: 'Shop order paid',
        },
      });
    }
  });
};

export const releaseReservedShopOrder = async ({ orderId, userId }) => {
  return prisma.$transaction(async (tx) => {
    const orderItems = await tx.orderItemV2.findMany({
      where: { orderId, deletedAt: null },
    });

    for (const line of orderItems) {
      if (!line.productId || line.quantity <= 0) {
        continue;
      }

      const alreadyCommitted = await tx.inventoryMovement.findFirst({
        where: {
          orderItemId: line.orderItemId,
          type: InventoryMovementType.COMMIT,
        },
      });

      if (alreadyCommitted) {
        continue;
      }

      const alreadyReleased = await tx.inventoryMovement.findFirst({
        where: {
          orderItemId: line.orderItemId,
          type: InventoryMovementType.RELEASE,
        },
      });

      if (alreadyReleased) {
        continue;
      }

      const inventory = await tx.inventoryItem.findUnique({
        where: { productId: line.productId },
      });

      if (!inventory) {
        continue;
      }

      await tx.inventoryItem.update({
        where: { productId: line.productId },
        data: {
          quantityReserved: { decrement: line.quantity },
        },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: inventory.inventoryItemId,
          productId: line.productId,
          orderItemId: line.orderItemId,
          userId: userId || null,
          type: InventoryMovementType.RELEASE,
          quantity: line.quantity,
          reason: 'Shop order cancelled',
        },
      });
    }
  });
};

export const restockCancelledOrderItems = async ({
  orderItems,
  userId,
  orderCode,
}) => {
  return prisma.$transaction(async (tx) => {
    for (const line of orderItems) {
      let product = null;

      if (line.code) {
        product = await tx.product.findFirst({
          where: { code: line.code, deletedAt: null },
        });
      }

      if (!product && line.name) {
        product = await tx.product.findFirst({
          where: { name: line.name, deletedAt: null },
        });
      }

      if (!product) {
        continue;
      }

      const inventory = await tx.inventoryItem.findUnique({
        where: { productId: product.productId },
      });

      if (!inventory) {
        continue;
      }

      const quantity = Number(line.quantity) || 0;
      if (quantity <= 0) {
        continue;
      }

      await tx.inventoryItem.update({
        where: { productId: product.productId },
        data: {
          quantityOnHand: { increment: quantity },
        },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: inventory.inventoryItemId,
          productId: product.productId,
          userId: userId || null,
          type: InventoryMovementType.RESTOCK,
          quantity,
          reason: orderCode
            ? `Order cancelled (${orderCode})`
            : 'Order cancelled',
        },
      });
    }
  });
};
