import { ShippingType, TransactionSource } from '@prisma/client';
import { validateSession } from '@/config/api-validation';
import { createPurchase } from '@/prisma/services/purchase-history';
import { createOrderFee } from '@/prisma/services/shop';
import { createTransaction } from '@/prisma/services/transaction';
import crypto from 'crypto';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    try {
      const session = await validateSession(req, res);
      const { items, shippingFee, deliveryAddress, contactNumber, paymentType } = req.body;
      const email = session.user.email;
      const userId = session.user.userId;
      let result;

      if (paymentType === 'INSTALLMENT') {
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalWithShipping = total + shippingFee.fee;
        const installmentAmount = totalWithShipping / 5;
        const interestRate = 0.02;
        const payments = Array.from({ length: 5 }, (_, i) =>
          installmentAmount * Math.pow(1 + interestRate, i + 1)
        );

        result = await createOrderFee({
          userId,
          email,
          items,
          shippingFee,
          deliveryAddress,
          contactNumber,
          paymentType,
          payments,
        });
      } else {
        // Process FULL_PAYMENT
        result = await createPurchase({
          items,
          shippingFee,
          deliveryAddress,
          contactNumber,
          paymentType,
        });

        if (result.errors) {
          throw new Error(result.errors.error.msg);
        }

        const { id, transactionId, total } = result;
        const transaction = await createTransaction(
          session.user.userId,
          session.user.email,
          transactionId,
          total,
          'STORE',
          id,
          TransactionSource.STORE,
          'ONLINE'
        );

        // Function to generate a unique order code
        async function generateUniqueOrderCode(prisma) {
          let uniqueOrderCode;
          let isUnique = false;

          while (!isUnique) {
            uniqueOrderCode = `ORDER-${crypto
              .createHash('md5')
              .update(Date.now().toString() + Math.random().toString())
              .digest('hex')
              .substring(0, 6)
              .toUpperCase()}`;

            const existingOrder = await prisma.orderFee.findFirst({
              where: { orderCode: uniqueOrderCode },
            });

            if (!existingOrder) {
              isUnique = true;
            }
          }

          return uniqueOrderCode;
        }

        // Generate the unique order code
        const uniqueOrderCode = await generateUniqueOrderCode(prisma);

        // Create the order fee record in the database
        await prisma.orderFee.create({
          data: {
            order: 0,
            paymentType,
            orderCode: uniqueOrderCode,
            transaction: {
              connect: {
                transactionId: transactionId,
              },
            },
            user: {
              connect: {
                id: session.user.userId,
              },
            },
          },
        });

        res.status(200).json({ data: { paymentLink: transaction?.url } });
        return;
      }

      // Handle any errors from createOrderFee or createPurchase
      if (result.errors) {
        res.status(400).json(result);
        return;
      }

      // For successful INSTALLMENT processing
      res.status(200).json({ data: { paymentLink: result.paymentLink } });

    } catch (error) {
      console.error('API Handler Error:', error.message);
      res.status(500).json({ errors: { error: { msg: error.message } } });
    }
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
