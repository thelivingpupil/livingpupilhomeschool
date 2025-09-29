import { ShippingType, TransactionSource } from '@prisma/client';
import { validateSession } from '@/config/api-validation';
import { createPurchase } from '@/prisma/services/purchase-history';
import { createOrderFee } from '@/prisma/services/shop';
import { createTransaction } from '@/prisma/services/transaction';
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
import crypto from 'crypto';
import prisma from '@/prisma/index';
import { sendMail } from '@/lib/server/mail';
import { getGuardianInformation } from '@/prisma/services/user';
import { getParentFirstName } from '@/utils/index';
import { sendMailWithGmail } from '@/lib/server/gmail';
import sanityClient from '@/lib/server/sanity';
import { cancelOrder } from '@/prisma/services/shop';

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

      let result;
      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const totalWithShipping = total + shippingFee.fee;
      let installmentAmount = 0;
      let totalPayment = 0;
      let firstPayment = 0;
      let payments;
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
            shippingFee.fee, // shipping as its own first payment
            ...Array(5).fill(installmentAmount), // then 5 installments
          ];
        }
        totalPayment = installmentAmount * 5 + shippingFee.fee;
        result = await createOrderFee({
          userId,
          email,
          items,
          shippingFee,
          deliveryAddress,
          contactNumber,
          paymentType,
          payments,
          signatureLink,
        });
        console.log('Create Order Fee Result:', result);
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
        });

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
        const totalAmountDue = Number(total); // Removed +20 gateway fee
        const transaction = await createTransaction(
          session.user.userId,
          session.user.email,
          transactionId,
          totalAmountDue,
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
            orderStatus: 'Order_Placed',
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

        await sendMail({
          from: process.env.EMAIL_FROM,
          html: fullHtml({
            parentName: parentFirstName,
            orderCode: uniqueOrderCode,
            orderDate: new Date().toLocaleDateString('en-US'),
            shipping: shippingFee.fee,
            subTotal: total - shippingFee.fee,
            total: totalWithShipping,
            paymentType,
          }),
          subject: `[Living Pupil Homeschool] Invoice for ${uniqueOrderCode}`,
          text: fullText({
            parentFirstName,
          }),
          to: email,
        });

        await sendMailWithGmail({
          sender: 'shop', // Dynamically select the account based on sender
          to: email,
          subject: `[Action Needed] Confirmation of ${uniqueOrderCode} from LP Shop`,
          text: orderText({ parentFirstName }), // Generate text content from the template
          html: orderHtml({
            parentName: parentFirstName,
            orderCode: uniqueOrderCode,
            reciever: parentFullName,
            deliveryAddress: deliveryAddress,
            contactNumber: contactNumber,
          }), // Generate HTML content from the template
        });

        res.status(200).json({
          data: {
            paymentLink: transaction?.url,
            amount: totalWithShipping,
            transactionId: transactionId,
          },
        });
        return;
      }

      // Handle any errors from createOrderFee or createPurchase
      if (result.errors) {
        res.status(400).json(result);
        return;
      }
      console.log('Order Result:', result);
      // For successful INSTALLMENT processing
      res.status(200).json({
        data: {
          paymentLink: result.paymentLink,
          amount: firstPayment,
          totalPayment: totalPayment,
          transactionId: result.transactionId,
          payments: payments,
        },
      });
    } catch (error) {
      console.error('API Handler Error:', error.message);
      res.status(500).json({ errors: { error: { msg: error.message } } });
    }
  } else if (method === 'PATCH') {
    const { patch, order } = req.body;

    if (patch === 'cancel') {
      try {
        // Step 1: Find the order with `order: 0`
        const orderIndex = order.filter((o) => o.order === 0);
        const orderItems =
          orderIndex[0]?.transaction.purchaseHistory?.orderItems || [];

        // Step 2: Extract item names
        const itemNames = orderItems.map((item) => item.name);

        // Step 3: Fetch current inventory from Sanity
        const currentInventory = await sanityClient.fetch(
          `*[_type == "shopItems" && name in $itemNames]`,
          { itemNames }
        );

        // Step 4: Prepare inventory restock patches
        const inventoryUpdates = orderItems
          .map((purchasedItem) => {
            const inventoryItem = currentInventory.find(
              (item) => item.name === purchasedItem.name
            );
            if (inventoryItem) {
              const newQuantity =
                inventoryItem.inventory + purchasedItem.quantity;
              return {
                id: inventoryItem._id,
                patch: {
                  set: { inventory: newQuantity },
                },
              };
            }
            return null;
          })
          .filter(Boolean);

        // Step 5: Commit inventory changes
        const transaction = sanityClient.transaction();
        inventoryUpdates.forEach((update) => {
          transaction.patch(update.id, update.patch);
        });

        const result = await transaction.commit();

        // Step 6: Update order status in your DB
        const orderCode = orderIndex[0]?.orderCode;
        if (orderCode) {
          await cancelOrder(orderCode);
        }

        // Step 7: Respond with success
        res.status(200).json({ success: true, updated: result });
      } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ errors: { error: { msg: 'Patch unkown' } } });
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
