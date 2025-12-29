import { validateSession } from '@/config/api-validation';
import { getUsers } from '@/prisma/services/user';
import { deactivate, reactivate } from '@/prisma/services/user';

const ALLOW_DEACTIVATION = true;

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    await validateSession(req, res);
    const users = await getUsers();
    res.status(200).json({ data: { users } });
  } else if (method === 'PUT') {
    // Logic to handle PUT request (reactivate account)
    // Require authentication and ADMIN role
    const session = await validateSession(req, res);

    if (!session || session.user?.userType !== 'ADMIN') {
      return res.status(403).json({ errors: { error: { msg: 'Forbidden: Admin access required' } } });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ errors: { error: { msg: 'User ID is required' } } });
    }
    await reactivate(userId);
    res.status(200).json({ data: { userId } });
  } else if (method === 'DELETE') {
    // Logic to handle DELETE request (deactivate account)
    // Require authentication and ADMIN role
    const session = await validateSession(req, res);

    if (!session || session.user?.userType !== 'ADMIN') {
      return res.status(403).json({ errors: { error: { msg: 'Forbidden: Admin access required' } } });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (ALLOW_DEACTIVATION) {
      await deactivate(userId);
      res.status(200).json({ data: { userId } });
    } else {
      res.status(403).json({ errors: { error: { msg: 'Account deactivation is not allowed' } } });
    }
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
