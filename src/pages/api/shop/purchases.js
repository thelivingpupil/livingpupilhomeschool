import { validateSession } from '@/config/api-validation';
import { getPurchaseHistory } from '@/prisma/services/purchase-history';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    const session = await validateSession(req, res);
    const purchaseHistory = await getPurchaseHistory(session.user.userId);
    res.status(200).json({ data: { purchaseHistory } });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
