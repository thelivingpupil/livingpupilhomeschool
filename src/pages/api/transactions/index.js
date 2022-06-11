import { validateSession } from '@/config/api-validation';
import { getTransactions } from '@/prisma/services/transaction';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    const session = await validateSession(req, res);
    const transactions = await getTransactions(
      session.user.userId,
      session.user.email
    );
    res.status(200).json({ data: { transactions } });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
