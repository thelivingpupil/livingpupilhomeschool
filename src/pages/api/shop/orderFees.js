import { validateSession } from '@/config/api-validation';
import { getUserOrderFees } from '@/prisma/services/shop';
import { updateOrderFeeStatus } from '@/prisma/services/shop';
const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    const session = await validateSession(req, res);
    const orderFees = await getUserOrderFees(session.user.userId);
    res.status(200).json({ data: { orderFees } });
  } else if (method === 'PATCH') {
    // Require authentication for updating order status
    const session = await validateSession(req, res);

    // Only ADMIN users can update order status
    if (!session || session.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        errors: { error: { msg: 'Forbidden: Admin access required' } }
      });
    }

    const { orderCode, orderStatus } = req.body;
    await updateOrderFeeStatus(orderCode, orderStatus);
    res.status(200).json({ data: { orderCode, orderStatus } });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
