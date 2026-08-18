import { ShippingType } from '@prisma/client';
import { validateSession } from '@/config/api-validation';
import {
  html as fullHtml,
  text as fullText,
} from '@/config/email-templates/shop/invoiceFull';
import {
  html as installmentHtml,
  text as installmentText,
} from '@/config/email-templates/shop/invoiceInstallment';
import {
  html as orderHtml,
  text as orderText,
} from '@/config/email-templates/shop/orderPlacedFull';
import { sendMail } from '@/lib/server/mail';
import { getGuardianInformation } from '@/prisma/services/user';
import { getParentFirstName } from '@/utils/index';
import { cancelOrder } from '@/prisma/services/shop';
import { restockCancelledOrderItems } from '@/prisma/services/inventory';
import {
  cancelShopOrderV2,
  createShopOrderV2,
  findRecentDuplicateOrderV2,
  getShopOrderV2ByCode,
  requestCancelShopOrderV2,
} from '@/prisma/services/order-v2';
import { renderInvoicePdf } from '@/lib/server/shop-invoice-pdf';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    try {
      const session = await validateSession(req, res);
      const {
        items,
        shippingFee,
        deliveryAddress,
        contactNumber,
        paymentType,
        signatureLink,
      } = req.body;
      const email = session.user.email;
      const userId = session.user.userId;
      const guardian = await getGuardianInformation(userId);
      const parentFullName = guardian.primaryGuardianName;
      const parentFirstName = getParentFirstName(parentFullName);

      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const totalWithShipping = total + shippingFee.fee;

      const existingOrder = await findRecentDuplicateOrderV2({
        userId,
        items,
        deliveryAddress,
        contactNumber,
        paymentType,
        totalAmount: totalWithShipping,
        skipTotalCheck: paymentType === 'INSTALLMENT',
      });

      if (existingOrder) {
        res.status(200).json({
          data: {
            paymentLink: existingOrder.paymentLink,
            amount: existingOrder.amount || totalWithShipping,
            transactionId: existingOrder.transactionId,
          },
        });
        return;
      }

      let installmentAmount = 0;
      let totalPayment = totalWithShipping;
      let firstPayment = totalWithShipping;
      let payments = [totalWithShipping];

      if (paymentType === 'INSTALLMENT') {
        const interestRate = 0.1;
        installmentAmount = (total * (1 + interestRate)) / 5;

        firstPayment =
          shippingFee.key !== ShippingType.PICK_UP
            ? shippingFee.fee
            : installmentAmount;
        if (shippingFee.key === ShippingType.PICK_UP) {
          payments = Array(5).fill(installmentAmount);
        } else {
          payments = [
            shippingFee.fee,
            ...Array(5).fill(installmentAmount),
          ];
        }
        totalPayment = installmentAmount * 5 + shippingFee.fee;
      }

      const result = await createShopOrderV2({
        userId,
        email,
        items,
        shippingFee,
        deliveryAddress,
        contactNumber,
        paymentType,
        signatureLink,
        payments,
      });

      if (result?.errors) {
        res.status(400).json(result);
        return;
      }

      let invoiceAttachments = [];
      try {
        const orderForInvoice = await getShopOrderV2ByCode(result.orderCode);
        if (orderForInvoice) {
          const pdfBuffer = await renderInvoicePdf(orderForInvoice);
          invoiceAttachments = [
            {
              filename: `invoice-${result.orderCode}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ];
        }
      } catch (pdfError) {
        console.error('Shop invoice PDF generation failed:', pdfError);
      }

      if (paymentType === 'INSTALLMENT') {
        await sendMail({
          from: process.env.EMAIL_FROM,
          html: installmentHtml({
            parentName: parentFirstName,
            orderCode: result.orderCode,
            orderDate: new Date().toLocaleDateString('en-US'),
            shipping: shippingFee.fee,
            subTotal: total,
            total: totalPayment,
            installment: installmentAmount,
            paymentType,
          }),
          subject: `[Invoice] Invoice for ${result.orderCode}`,
          text: installmentText({
            parentFirstName,
          }),
          to: email,
          attachments: invoiceAttachments,
        });
      } else {
        await sendMail({
          from: process.env.EMAIL_FROM,
          html: fullHtml({
            parentName: parentFirstName,
            orderCode: result.orderCode,
            orderDate: new Date().toLocaleDateString('en-US'),
            shipping: shippingFee.fee,
            subTotal: total,
            total: totalWithShipping,
            paymentType,
          }),
          subject: `[Living Pupil Homeschool] Invoice for ${result.orderCode}`,
          text: fullText({
            parentFirstName,
          }),
          to: email,
          attachments: invoiceAttachments,
        });
      }

      await sendMail({
        from: process.env.EMAIL_FROM,
        html: orderHtml({
          parentName: parentFirstName,
          orderCode: result.orderCode,
          reciever: parentFullName,
          deliveryAddress: deliveryAddress,
          contactNumber: contactNumber,
        }),
        subject: `[Action Needed] Confirmation of ${result.orderCode} from LP Shop`,
        text: orderText({
          parentFirstName,
        }),
        to: email,
      });

      res.status(200).json({
        data: {
          paymentLink: result.paymentLink,
          amount: firstPayment,
          totalPayment:
            paymentType === 'INSTALLMENT' ? totalPayment : undefined,
          transactionId: result.transactionId,
          payments: paymentType === 'INSTALLMENT' ? payments : undefined,
          orderCode: result.orderCode,
        },
      });
    } catch (error) {
      console.error('API Handler Error:', error.message);
      res.status(500).json({ errors: { error: { msg: error.message } } });
    }
  } else if (method === 'PATCH') {
    const { patch, order, orderCode, reason } = req.body;

    if (patch === 'requestCancel') {
      try {
        const session = await validateSession(req, res);
        if (!orderCode) {
          return res.status(400).json({
            errors: { error: { msg: 'orderCode is required' } },
          });
        }
        await requestCancelShopOrderV2({
          orderCode,
          userId: session.user.userId,
          reason,
        });
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Request cancel error:', error);
        const statusCode =
          error.code === 'FORBIDDEN'
            ? 403
            : error.code === 'ORDER_NOT_FOUND'
              ? 404
              : error.code === 'REASON_REQUIRED' ||
                  error.code === 'REQUEST_EXISTS' ||
                  error.code === 'ALREADY_PAID' ||
                  error.code === 'ORDER_CANCELLED'
                ? 400
                : 500;
        return res.status(statusCode).json({
          errors: {
            error: { msg: error.message || 'Failed to request cancellation' },
          },
        });
      }
    }

    if (patch === 'cancel') {
      try {
        const session = await validateSession(req, res);

        // V2 cancel by orderCode — admin only for hard cancel
        if (orderCode && !order) {
          if (session?.user?.userType !== 'ADMIN') {
            return res.status(403).json({
              errors: {
                error: {
                  msg: 'Parents must use Request to cancel',
                },
              },
            });
          }
          await cancelShopOrderV2({
            orderCode,
            userId: session?.user?.userId,
            enforceOwner: false,
          });
          res.status(200).json({ success: true });
          return;
        }

        // Legacy V1 cancel
        const orderIndex = (order || []).filter((o) => o.order === 0);
        const orderItems =
          orderIndex[0]?.transaction.purchaseHistory?.orderItems || [];
        const legacyOrderCode = orderIndex[0]?.orderCode;

        await restockCancelledOrderItems({
          orderItems,
          userId: session?.user?.userId,
          orderCode: legacyOrderCode,
        });

        if (legacyOrderCode) {
          await cancelOrder(legacyOrderCode);
        }

        res.status(200).json({ success: true });
      } catch (error) {
        console.error('Cancel order error:', error);
        const statusCode =
          error.code === 'FORBIDDEN'
            ? 403
            : error.code === 'ORDER_NOT_FOUND'
              ? 404
              : error.code === 'ALREADY_PAID'
                ? 400
                : 500;
        res.status(statusCode).json({
          errors: {
            error: { msg: error.message || 'Failed to cancel order' },
          },
        });
      }
    } else {
      res.status(500).json({ errors: { error: { msg: 'Unknown Patch' } } });
    }
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
