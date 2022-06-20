import { validateSession } from '@/config/api-validation';
import { countUsers } from '@/prisma/services/user';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    await validateSession(req, res);
    const users = await countUsers();
    res.status(200).json({ data: { users } });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
