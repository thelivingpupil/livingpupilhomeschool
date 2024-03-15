import { validateSession } from '@/config/api-validation';
import { getUsers } from '@/prisma/services/user';
import { deactivate,reactivate } from '@/prisma/services/user';

const ALLOW_DEACTIVATION = true;

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    await validateSession(req, res);
    const users = await getUsers();
    res.status(200).json({ data: { users } });
  } else if (method === 'PUT') {
    // Logic to handle PUT request (reactivate account)
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    await reactivate(userId);
    res.status(200).json({ data: { userId } });
  } else if (method === 'DELETE') {
    // Logic to handle DELETE request (deactivate account)
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (ALLOW_DEACTIVATION) {
      await deactivate(userId);
      res.status(200).json({ data: { userId } });
    } else {
      res.status(403).json({ error: 'Account deactivation is not allowed' });
    }
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
