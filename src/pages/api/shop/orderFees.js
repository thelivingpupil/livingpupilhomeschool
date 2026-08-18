import { validateSession } from '@/config/api-validation';
import { getUserOrderFees, updateOrderFeeStatus } from '@/prisma/services/shop';
import { getUserShopOrdersV2AsLegacyFees } from '@/prisma/services/order-v2';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    const session = await validateSession(req, res);
    const userId = session.user.userId;

    const [orderFees, v2Fees] = await Promise.all([
      getUserOrderFees(userId),
      getUserShopOrdersV2AsLegacyFees(userId),
    ]);

    const legacyFees = orderFees?.orderFee || [];
    // V2 first so newest checkouts appear ahead of old V1 fees when grouped
    const mergedFees = [...v2Fees, ...legacyFees];

    return res.status(200).json({
      data: {
        orderFees: {
          email: orderFees?.email,
          name: orderFees?.name,
          userCode: orderFees?.userCode,
          orderFee: mergedFees,
        },
      },
    });
  }

  if (method === 'PATCH') {
    const session = await validateSession(req, res);

    if (!session || session.user?.userType !== 'ADMIN') {
      return res.status(403).json({
        errors: { error: { msg: 'Forbidden: Admin access required' } },
      });
    }

    const { orderCode, orderStatus } = req.body;
    await updateOrderFeeStatus(orderCode, orderStatus);
    return res.status(200).json({ data: { orderCode, orderStatus } });
  }

  return res.status(405).json({ error: `${method} method unsupported` });
};

export default handler;
