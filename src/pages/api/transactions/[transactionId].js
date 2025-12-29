import { validateSession } from '@/config/api-validation'
import { updateTransaction, changeTransactionAmount } from '@/prisma/services/transaction';
import prisma from '@/prisma/index';

const handler = async (req, res) => {
  const { method, body, query } = req;

  if (method === 'PUT') {
    const session = await validateSession(req, res);
    const { transactionId } = query;
    const { amount, balance, payment, status } = body;

    // Verify transaction ownership or ADMIN access
    const transaction = await prisma.transaction.findUnique({
      where: { transactionId },
      select: { userId: true },
    });

    if (!transaction) {
      return res.status(404).json({
        errors: { error: { msg: 'Transaction not found' } },
      });
    }

    // Only allow if user owns the transaction or is ADMIN
    if ((!transaction.userId || transaction.userId !== session.user.userId) && session.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        errors: { error: { msg: 'Forbidden: You can only update your own transactions' } },
      });
    }

    const updatedTransaction = await updateTransaction(
      transactionId,
      'MANUAL',
      status,
      'Successfully updated transaction manually',
      balance,
      payment,
      amount
    );
    res.status(200).json({ data: { transaction: updatedTransaction } });
  } else if (method === 'PATCH') {
    const session = await validateSession(req, res);
    const { transactionId } = query;
    const { newAmount, balance, payment } = body;

    // Verify transaction ownership or ADMIN access
    const transaction = await prisma.transaction.findUnique({
      where: { transactionId },
      select: { userId: true },
    });

    if (!transaction) {
      return res.status(404).json({
        errors: { error: { msg: 'Transaction not found' } },
      });
    }

    // Only allow if user owns the transaction or is ADMIN
    if ((!transaction.userId || transaction.userId !== session.user.userId) && session.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        errors: { error: { msg: 'Forbidden: You can only update your own transactions' } },
      });
    }

    const updatedTransaction = await changeTransactionAmount(transactionId, newAmount, balance, payment);
    res.status(200).json({ data: { transaction: updatedTransaction } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
