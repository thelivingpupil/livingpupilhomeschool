import { validateSession } from '@/config/api-validation';
import prisma from '@/prisma/index';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'PUT') {
    try {
      const session = await validateSession(req, res);
      const { transactionId, paymentProofLink } = req.body;

      if (!transactionId || !paymentProofLink) {
        return res.status(400).json({
          errors: {
            error: {
              msg: 'Transaction ID and payment proof link are required',
            },
          },
        });
      }

      const v1 = await prisma.transaction.findUnique({
        where: { transactionId },
        select: { userId: true },
      });

      if (v1) {
        if (!v1.userId || v1.userId !== session.user.userId) {
          return res.status(403).json({
            errors: {
              error: {
                msg: 'Forbidden: You can only upload proof for your own transactions',
              },
            },
          });
        }

        const updatedTransaction = await prisma.transaction.update({
          where: { transactionId },
          data: { paymentProofLink },
          select: {
            transactionId: true,
            paymentProofLink: true,
            paymentStatus: true,
          },
        });

        return res.status(200).json({
          data: {
            message: 'Payment proof uploaded successfully',
            transaction: updatedTransaction,
          },
        });
      }

      const v2 = await prisma.transactionV2.findUnique({
        where: { transactionId },
        select: { userId: true },
      });

      if (!v2) {
        return res.status(404).json({
          errors: { error: { msg: 'Transaction not found' } },
        });
      }

      if (!v2.userId || v2.userId !== session.user.userId) {
        return res.status(403).json({
          errors: {
            error: {
              msg: 'Forbidden: You can only upload proof for your own transactions',
            },
          },
        });
      }

      const updatedTransaction = await prisma.transactionV2.update({
        where: { transactionId },
        data: { paymentProofLink },
        select: {
          transactionId: true,
          paymentProofLink: true,
          paymentStatus: true,
        },
      });

      return res.status(200).json({
        data: {
          message: 'Payment proof uploaded successfully',
          transaction: updatedTransaction,
        },
      });
    } catch (error) {
      console.error('Payment proof upload error:', error);
      return res.status(500).json({
        errors: { error: { msg: 'Failed to upload payment proof' } },
      });
    }
  }

  return res.status(405).json({
    errors: { error: { msg: `${method} method unsupported` } },
  });
};

export default handler;
