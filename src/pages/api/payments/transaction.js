import crypto from 'crypto';

import { validateSession } from '@/config/api-validation';
import {
  createTransaction,
  getTransaction,
  renewTransaction,
} from '@/prisma/services/transaction';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    const session = await validateSession(req, res);
    const { amount, description } = req.body;
    const transaction = await createTransaction(
      session.user.userId,
      session.user.email,
      crypto.randomUUID(),
      amount,
      description
    );
    res.status(200).json({ data: { paymentLink: transaction?.url } });
  } else if (method === 'PUT') {
    const session = await validateSession(req, res);
    const { referenceNumber, transactionId } = req.body;
    const transaction = await getTransaction(transactionId, referenceNumber);

    if (transaction) {
      const newTransaction = await renewTransaction(
        session.user.email,
        transaction.transactionId,
        transaction.amount,
        transaction.description,
        transaction.source
      );
      res.status(200).json({ data: { paymentLink: newTransaction?.url } });
    } else {
      res
        .status(400)
        .json({ errors: { error: { msg: `Try again in a few minutes...` } } });
    }
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
