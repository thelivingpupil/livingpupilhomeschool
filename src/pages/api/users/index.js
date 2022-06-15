import { validateSession } from '@/config/api-validation';
import { getUsers } from '@/prisma/services/user';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    await validateSession(req, res);
    const users = await getUsers();
    res.status(200).json({ data: { users } });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
