import { validateSession } from '@/config/api-validation';
import { renderInvoicePdf } from '@/lib/server/shop-invoice-pdf';
import {
  getShopOrderV2ByCode,
  isOrderPaidEnough,
} from '@/prisma/services/order-v2';

const handler = async (req, res) => {
  const { method } = req;

  if (method !== 'GET') {
    return res.status(405).json({
      errors: { error: { msg: `${method} method unsupported` } },
    });
  }

  try {
    const session = await validateSession(req, res);
    const orderCode = String(req.query.orderCode || '').trim();

    if (!orderCode) {
      return res.status(400).json({
        errors: { error: { msg: 'orderCode is required' } },
      });
    }

    const order = await getShopOrderV2ByCode(orderCode);

    if (!order) {
      return res.status(404).json({
        errors: { error: { msg: 'Order not found' } },
      });
    }

    if (order.userId !== session.user.userId) {
      return res.status(403).json({
        errors: { error: { msg: 'Forbidden' } },
      });
    }

    if (!isOrderPaidEnough(order)) {
      return res.status(403).json({
        errors: {
          error: {
            msg: 'Invoice is available after a successful payment',
          },
        },
      });
    }

    const pdfBuffer = await renderInvoicePdf(order);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="invoice-${order.orderCode}.pdf"`
    );
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error('Parent shop invoice error:', error);
    return res.status(500).json({
      errors: { error: { msg: 'Failed to generate invoice' } },
    });
  }
};

export default handler;
