import { validateSession } from '@/config/api-validation';
import { countUsers, countVerifiedUsers } from '@/prisma/services/user';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    await validateSession(req, res);
    const total = await countUsers();
    const verifiedUsers = await countVerifiedUsers();
    res.status(200).json({ data: { total, verifiedUsers } });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
