import { validateSession } from '@/config/api-validation'
import { updateTransaction, changeTransactionAmount } from '@/prisma/services/transaction';

const handler = async (req, res) => {
  const { method, body, query } = req;

  if (method === 'PUT') {
    await validateSession(req, res);
    const { transactionId } = query;
    const { amount, balance, payment, status } = body;

    const transaction = await updateTransaction(
      transactionId,
      'MANUAL',
      status,
      'Successfully updated transaction manually',
      balance,
      payment,
      amount
    );
    res.status(200).json({ data: { transaction } });
  } else if (method === 'PATCH') {
    await validateSession(req, res);
    const { transactionId } = query;
    const { newAmount, payment } = body;
    const balance = newAmount - payment;

    const transaction = await changeTransactionAmount(transactionId, newAmount, balance);
    res.status(200).json({ data: { transaction } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
