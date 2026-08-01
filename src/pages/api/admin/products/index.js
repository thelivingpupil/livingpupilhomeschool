import { validateSession } from '@/config/api-validation';
import {
  adjustProduct,
  createProduct,
  getProducts,
  restockProduct,
  updateProduct,
} from '@/prisma/services/product';

const withAvailability = (product) => {
  const onHand = product.inventory?.quantityOnHand ?? 0;
  const reserved = product.inventory?.quantityReserved ?? 0;

  return {
    ...product,
    available: onHand - reserved,
  };
};

const handler = async (req, res) => {
  const { method } = req;

  const session = await validateSession(req, res);

  if (!session || session.user?.userType !== 'ADMIN') {
    return res.status(403).json({
      errors: { error: { msg: 'Forbidden: Admin access required' } },
    });
  }

  if (method === 'GET') {
    try {
      const products = await getProducts();
      return res.status(200).json({
        data: { products: products.map(withAvailability) },
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({
        errors: { error: { msg: 'Failed to fetch products' } },
      });
    }
  }

  if (method === 'POST') {
    try {
      const {
        code,
        name,
        description,
        price,
        imageUrl,
        imagePath,
        isActive,
        initialStock,
        reorderLevel,
      } = req.body;

      if (!code || !name || price === undefined || price === null || price === '') {
        return res.status(400).json({
          errors: {
            error: { msg: 'code, name, and price are required' },
          },
        });
      }

      const parsedPrice = Number(price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          errors: { error: { msg: 'price must be a non-negative number' } },
        });
      }

      const product = await createProduct({
        code,
        name,
        description,
        price: parsedPrice,
        imageUrl,
        imagePath,
        isActive,
        initialStock,
        reorderLevel,
        userId: session.user.userId,
      });

      return res.status(201).json({ data: { product: withAvailability(product) } });
    } catch (error) {
      console.error('Error creating product:', error);

      if (error.code === 'P2002') {
        return res.status(409).json({
          errors: {
            error: { msg: 'A product with this code already exists' },
          },
        });
      }

      return res.status(500).json({
        errors: {
          error: { msg: error.message || 'Failed to create product' },
        },
      });
    }
  }

  if (method === 'PUT') {
    try {
      const {
        productId,
        code,
        name,
        description,
        price,
        imageUrl,
        imagePath,
        isActive,
        reorderLevel,
      } = req.body;

      if (!productId) {
        return res.status(400).json({
          errors: { error: { msg: 'productId is required' } },
        });
      }

      let parsedPrice;
      if (price !== undefined && price !== null && price !== '') {
        parsedPrice = Number(price);
        if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
          return res.status(400).json({
            errors: { error: { msg: 'price must be a non-negative number' } },
          });
        }
      }

      const product = await updateProduct({
        productId,
        code,
        name,
        description,
        price: parsedPrice,
        imageUrl,
        imagePath,
        isActive,
        reorderLevel,
      });

      return res.status(200).json({ data: { product: withAvailability(product) } });
    } catch (error) {
      console.error('Error updating product:', error);

      if (error.code === 'P2002') {
        return res.status(409).json({
          errors: {
            error: { msg: 'A product with this code already exists' },
          },
        });
      }

      return res.status(500).json({
        errors: {
          error: { msg: error.message || 'Failed to update product' },
        },
      });
    }
  }

  if (method === 'PATCH') {
    try {
      const { action = 'restock', productId, quantity, reason, direction } =
        req.body;

      if (!productId) {
        return res.status(400).json({
          errors: { error: { msg: 'productId is required' } },
        });
      }

      if (quantity === undefined || quantity === null || quantity === '') {
        return res.status(400).json({
          errors: { error: { msg: 'quantity is required' } },
        });
      }

      if (action === 'restock') {
        const product = await restockProduct({
          productId,
          quantity,
          reason,
          userId: session.user.userId,
        });

        return res
          .status(200)
          .json({ data: { product: withAvailability(product) } });
      }

      if (action === 'adjust') {
        const product = await adjustProduct({
          productId,
          quantity,
          direction,
          reason,
          userId: session.user.userId,
        });

        return res
          .status(200)
          .json({ data: { product: withAvailability(product) } });
      }

      return res.status(400).json({
        errors: {
          error: { msg: 'action must be restock or adjust' },
        },
      });
    } catch (error) {
      console.error('Error updating inventory:', error);

      if (
        error.code === 'INVALID_QUANTITY' ||
        error.code === 'INVALID_DIRECTION' ||
        error.code === 'INVALID_ADJUSTMENT' ||
        error.code === 'INVENTORY_NOT_FOUND'
      ) {
        return res.status(400).json({
          errors: { error: { msg: error.message } },
        });
      }

      return res.status(500).json({
        errors: {
          error: { msg: error.message || 'Failed to update inventory' },
        },
      });
    }
  }

  return res
    .status(405)
    .json({ errors: { error: { msg: `${method} method unsupported` } } });
};

export default handler;
