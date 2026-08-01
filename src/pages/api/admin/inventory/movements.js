import { InventoryMovementType } from '@prisma/client';
import { validateSession } from '@/config/api-validation';
import { getInventoryMovements } from '@/prisma/services/inventory';

const VALID_TYPES = new Set(Object.values(InventoryMovementType));

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
      const { productId, type } = req.query;

      if (type && !VALID_TYPES.has(type)) {
        return res.status(400).json({
          errors: {
            error: {
              msg: `type must be one of: ${[...VALID_TYPES].join(', ')}`,
            },
          },
        });
      }

      const movements = await getInventoryMovements({
        productId: productId || undefined,
        type: type || undefined,
      });

      return res.status(200).json({ data: { movements } });
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      return res.status(500).json({
        errors: { error: { msg: 'Failed to fetch inventory ledger' } },
      });
    }
  }

  return res
    .status(405)
    .json({ errors: { error: { msg: `${method} method unsupported` } } });
};

export default handler;
