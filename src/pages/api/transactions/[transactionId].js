const { validateSession } = require('@/config/api-validation');
const { updateTransaction } = require('@/prisma/services/transaction');

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
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
