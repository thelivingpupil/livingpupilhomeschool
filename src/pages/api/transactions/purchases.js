import { validateSession } from '@/config/api-validation';
import { getStorePurchases } from '@/prisma/services/purchase-history';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    await validateSession(req, res);
    const purchases = await getStorePurchases();
    res.status(200).json({ data: { purchases } });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
