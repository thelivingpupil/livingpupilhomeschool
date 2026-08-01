import { validateSession } from '@/config/api-validation';
import { updateTransaction } from '@/prisma/services/transaction';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'PUT') {
    try {
      const session = await validateSession(req, res);

      if (!session || session.user?.userType !== 'ADMIN') {
        return res.status(403).json({
          errors: { error: { msg: 'Forbidden: Admin access required' } },
        });
      }

      const { transactionId, paymentStatus, paymentReference, message } =
        req.body;

      if (!transactionId || !paymentStatus) {
        return res.status(400).json({
          errors: {
            error: { msg: 'Transaction ID and payment status are required' },
          },
        });
      }

      // Uses V1 then V2; on V2 STORE success, commits reserved shop inventory
      const updatedTransaction = await updateTransaction(
        transactionId,
        paymentReference || 'ADMIN',
        paymentStatus,
        message || 'Marked as paid by admin'
      );

      return res.status(200).json({
        data: {
          message: 'Payment status updated successfully',
          transaction: updatedTransaction,
        },
      });
    } catch (error) {
      console.error('Payment status update error:', error);
      const statusCode = error.message?.includes('not found') ? 404 : 500;
      return res.status(statusCode).json({
        errors: {
          error: { msg: error.message || 'Failed to update payment status' },
        },
      });
    }
  }

  return res.status(405).json({
    errors: { error: { msg: `${method} method unsupported` } },
  });
};

export default handler;
