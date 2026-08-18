import { InventoryMovementType } from '@prisma/client';
import prisma from '@/prisma/index';

export const getProducts = async () =>
  prisma.product.findMany({
    where: { deletedAt: null },
    include: { inventory: true },
    orderBy: { name: 'asc' },
  });

const storeProductWhere = {
  isActive: true,
  deletedAt: null,
};

export const toShopItem = (product) => {
  const onHand = product.inventory?.quantityOnHand ?? 0;
  const reserved = product.inventory?.quantityReserved ?? 0;

  return {
    id: product.productId,
    _id: product.productId,
    code: product.code,
    name: product.name,
    price: Number(product.price),
    image: product.imageUrl || null,
    description: product.description || '',
    categories: [],
    inventory: Math.max(0, onHand - reserved),
  };
};

export const getStoreProducts = async () => {
  const products = await prisma.product.findMany({
    where: storeProductWhere,
    include: { inventory: true },
    orderBy: { name: 'asc' },
  });

  return products.map(toShopItem);
};

export const getStoreProductById = async (productId) => {
  if (!productId) return null;

  const product = await prisma.product.findFirst({
    where: {
      productId,
      ...storeProductWhere,
    },
    include: { inventory: true },
  });

  return product ? toShopItem(product) : null;
};

export const createProduct = async ({
  code,
  name,
  description,
  price,
  imageUrl,
  imagePath,
  isActive = true,
  initialStock = 0,
  reorderLevel = 0,
  userId,
}) => {
  const stock = Math.max(0, Number(initialStock) || 0);
  const reorder = Math.max(0, Number(reorderLevel) || 0);

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        code: code.trim(),
        name: name.trim(),
        description: description?.trim() || null,
        price,
        imageUrl: imageUrl || null,
        imagePath: imagePath || null,
        isActive: isActive !== false,
      },
    });

    const inventory = await tx.inventoryItem.create({
      data: {
        productId: product.productId,
        quantityOnHand: stock,
        quantityReserved: 0,
        reorderLevel: reorder,
      },
    });

    if (stock > 0) {
      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: inventory.inventoryItemId,
          productId: product.productId,
          userId: userId || null,
          type: InventoryMovementType.RESTOCK,
          quantity: stock,
          reason: 'Initial stock',
        },
      });
    }

    return tx.product.findUnique({
      where: { productId: product.productId },
      include: { inventory: true },
    });
  });
};

export const restockProduct = async ({
  productId,
  quantity,
  reason,
  userId,
}) => {
  const amount = Number(quantity);

  if (!Number.isInteger(amount) || amount <= 0) {
    const error = new Error('quantity must be a positive integer');
    error.code = 'INVALID_QUANTITY';
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventoryItem.findUnique({
      where: { productId },
    });

    if (!inventory) {
      const error = new Error('Inventory record not found for product');
      error.code = 'INVENTORY_NOT_FOUND';
      throw error;
    }

    await tx.inventoryItem.update({
      where: { productId },
      data: {
        quantityOnHand: { increment: amount },
      },
    });

    await tx.inventoryMovement.create({
      data: {
        inventoryItemId: inventory.inventoryItemId,
        productId,
        userId: userId || null,
        type: InventoryMovementType.RESTOCK,
        quantity: amount,
        reason: reason?.trim() || 'Restock',
      },
    });

    return tx.product.findUnique({
      where: { productId },
      include: { inventory: true },
    });
  });
};

export const adjustProduct = async ({
  productId,
  quantity,
  direction,
  reason,
  userId,
}) => {
  const amount = Number(quantity);

  if (!Number.isInteger(amount) || amount <= 0) {
    const error = new Error('quantity must be a positive integer');
    error.code = 'INVALID_QUANTITY';
    throw error;
  }

  if (direction !== 'increase' && direction !== 'decrease') {
    const error = new Error('direction must be increase or decrease');
    error.code = 'INVALID_DIRECTION';
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventoryItem.findUnique({
      where: { productId },
    });

    if (!inventory) {
      const error = new Error('Inventory record not found for product');
      error.code = 'INVENTORY_NOT_FOUND';
      throw error;
    }

    const delta = direction === 'increase' ? amount : -amount;
    const nextOnHand = inventory.quantityOnHand + delta;

    if (nextOnHand < 0) {
      const error = new Error('Adjustment would make on-hand stock negative');
      error.code = 'INVALID_ADJUSTMENT';
      throw error;
    }

    if (nextOnHand < inventory.quantityReserved) {
      const error = new Error(
        `Adjustment would put on-hand (${nextOnHand}) below reserved (${inventory.quantityReserved})`
      );
      error.code = 'INVALID_ADJUSTMENT';
      throw error;
    }

    await tx.inventoryItem.update({
      where: { productId },
      data: {
        quantityOnHand: nextOnHand,
      },
    });

    const note = reason?.trim() || 'Inventory adjustment';
    await tx.inventoryMovement.create({
      data: {
        inventoryItemId: inventory.inventoryItemId,
        productId,
        userId: userId || null,
        type: InventoryMovementType.ADJUST,
        quantity: amount,
        reason: `${direction === 'increase' ? '+' : '-'}${amount}: ${note}`,
      },
    });

    return tx.product.findUnique({
      where: { productId },
      include: { inventory: true },
    });
  });
};

export const updateProduct = async ({
  productId,
  code,
  name,
  description,
  price,
  imageUrl,
  imagePath,
  isActive,
  reorderLevel,
}) => {
  const data = {};

  if (code !== undefined) data.code = code.trim();
  if (name !== undefined) data.name = name.trim();
  if (description !== undefined) {
    data.description = description?.trim() || null;
  }
  if (price !== undefined) data.price = price;
  if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
  if (imagePath !== undefined) data.imagePath = imagePath || null;
  if (isActive !== undefined) data.isActive = Boolean(isActive);

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.update({
      where: { productId },
      data,
    });

    if (reorderLevel !== undefined) {
      await tx.inventoryItem.update({
        where: { productId },
        data: { reorderLevel: Math.max(0, Number(reorderLevel) || 0) },
      });
    }

    return tx.product.findUnique({
      where: { productId: product.productId },
      include: { inventory: true },
    });
  });
};
