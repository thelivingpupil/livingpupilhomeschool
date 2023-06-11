import { TransactionSource } from '@prisma/client';

import { validateSession } from '@/config/api-validation';
import { createPurchase } from '@/prisma/services/purchase-history';
import { createTransaction } from '@/prisma/services/transaction';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    const session = await validateSession(req, res);
    const { items, shippingFee, deliveryAddress } = req.body;
    const { id, transactionId, total } = await createPurchase({
      items,
      shippingFee,
      deliveryAddress,
    });
    const transaction = await createTransaction(
      session.user.userId,
      session.user.email,
      transactionId,
      total,
      TransactionSource.STORE,
      id
    );
    res.status(200).json({ data: { paymentLink: transaction?.url } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
