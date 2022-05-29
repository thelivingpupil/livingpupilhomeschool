import crypto from 'crypto';

import { validateSession } from '@/config/api-validation';
import { createTransaction } from '@/prisma/services/transaction';

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
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
