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

      // Update the transaction with the payment proof link
      const updatedTransaction = await prisma.transaction.update({
        where: { transactionId },
        data: { paymentProofLink },
        select: {
          transactionId: true,
          paymentProofLink: true,
          paymentStatus: true,
        },
      });

      res.status(200).json({
        data: {
          message: 'Payment proof uploaded successfully',
          transaction: updatedTransaction,
        },
      });
    } catch (error) {
      console.error('Payment proof upload error:', error);
      res.status(500).json({
        errors: { error: { msg: 'Failed to upload payment proof' } },
      });
    }
  } else {
    res.status(405).json({
      errors: { error: { msg: `${method} method unsupported` } },
    });
  }
};

export default handler;
