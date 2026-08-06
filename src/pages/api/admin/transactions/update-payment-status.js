import { TransactionStatus } from '@prisma/client';

import { validateSession } from '@/config/api-validation';
import prisma from '@/prisma/index';
import { createRemainingMonthlyInstallments } from '@/prisma/services/school-fee';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'PUT') {
    try {
      const session = await validateSession(req, res);

      // Require ADMIN role to update payment status
      if (!session || session.user?.userType !== 'ADMIN') {
        return res.status(403).json({
          errors: { error: { msg: 'Forbidden: Admin access required' } },
        });
      }

      const { transactionId, paymentStatus } = req.body;

      if (!transactionId || !paymentStatus) {
        return res.status(400).json({
          errors: {
            error: { msg: 'Transaction ID and payment status are required' },
          },
        });
      }

      const existing = await prisma.transaction.findUnique({
        where: { transactionId },
        select: { paymentStatus: true },
      });
      const wasAlreadyPaid = existing?.paymentStatus === TransactionStatus.S;

      // Update the transaction payment status
      const updatedTransaction = await prisma.transaction.update({
        where: { transactionId },
        data: { paymentStatus },
        select: {
          transactionId: true,
          paymentStatus: true,
          amount: true,
          referenceNumber: true,
        },
      });

      if (!wasAlreadyPaid && paymentStatus === TransactionStatus.S) {
        try {
          await createRemainingMonthlyInstallments(transactionId);
        } catch (error) {
          console.error(
            `Failed to create remaining monthly installments for ${transactionId}:`,
            error
          );
        }
      }

      res.status(200).json({
        data: {
          message: 'Payment status updated successfully',
          transaction: updatedTransaction,
        },
      });
    } catch (error) {
      console.error('Payment status update error:', error);
      res.status(500).json({
        errors: { error: { msg: 'Failed to update payment status' } },
      });
    }
  } else {
    res.status(405).json({
      errors: { error: { msg: `${method} method unsupported` } },
    });
  }
};

export default handler;
