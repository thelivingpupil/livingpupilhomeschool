import { validateSession } from '@/config/api-validation';
import {
  approveCancelShopOrderV2,
  cancelShopOrderV2,
  getShopOrdersV2,
  rejectCancelShopOrderV2,
  updateShopOrderV2Status,
} from '@/prisma/services/order-v2';
import { updateTransaction } from '@/prisma/services/transaction';

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
      const orders = await getShopOrdersV2();
      return res.status(200).json({ data: { orders } });
    } catch (error) {
      console.error('Error fetching shop orders V2:', error);
      return res.status(500).json({
        errors: { error: { msg: 'Failed to fetch orders' } },
      });
    }
  }

  if (method === 'PATCH') {
    try {
      const { orderCode, action, status, transactionId } = req.body;

      if (action === 'markPaid') {
        if (!transactionId) {
          return res.status(400).json({
            errors: { error: { msg: 'transactionId is required' } },
          });
        }

        const transaction = await updateTransaction(
          transactionId,
          'ADMIN',
          'S',
          'Marked as paid by admin'
        );

        return res.status(200).json({
          data: { success: true, transaction },
        });
      }

      if (!orderCode) {
        return res.status(400).json({
          errors: { error: { msg: 'orderCode is required' } },
        });
      }

      if (action === 'cancel') {
        await cancelShopOrderV2({
          orderCode,
          userId: session.user.userId,
        });
        return res.status(200).json({ data: { success: true } });
      }

      if (action === 'approveCancel') {
        await approveCancelShopOrderV2({
          orderCode,
          userId: session.user.userId,
        });
        return res.status(200).json({ data: { success: true } });
      }

      if (action === 'rejectCancel') {
        await rejectCancelShopOrderV2({ orderCode });
        return res.status(200).json({ data: { success: true } });
      }

      if (action === 'updateStatus' || status) {
        await updateShopOrderV2Status({
          orderCode,
          status,
        });
        return res.status(200).json({ data: { success: true } });
      }

      return res.status(400).json({
        errors: {
          error: {
            msg: 'action must be cancel, approveCancel, rejectCancel, updateStatus, or markPaid',
          },
        },
      });
    } catch (error) {
      console.error('Error patching shop order V2:', error);
      const statusCode =
        error.code === 'ORDER_NOT_FOUND'
          ? 404
          : error.code === 'INVALID_STATUS' ||
              error.code === 'USE_CANCEL' ||
              error.code === 'ORDER_CANCELLED' ||
              error.code === 'NO_REQUEST' ||
              error.message?.includes('not found')
            ? 400
            : 500;
      return res.status(statusCode).json({
        errors: { error: { msg: error.message || 'Failed to update order' } },
      });
    }
  }

  return res.status(405).json({
    errors: { error: { msg: `${method} method unsupported` } },
  });
};

export default handler;
