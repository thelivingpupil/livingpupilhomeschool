import { validateSession } from '@/config/api-validation';
import prisma from '@/prisma/index';

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'PUT') {
        try {
            const session = await validateSession(req, res);
            const { transactionId, paymentStatus } = req.body;

            if (!transactionId || !paymentStatus) {
                return res.status(400).json({
                    errors: { error: { msg: 'Transaction ID and payment status are required' } }
                });
            }

            // Update the transaction payment status
            const updatedTransaction = await prisma.transaction.update({
                where: { transactionId },
                data: { paymentStatus },
                select: {
                    transactionId: true,
                    paymentStatus: true,
                    amount: true,
                    referenceNumber: true
                }
            });

            res.status(200).json({
                data: {
                    message: 'Payment status updated successfully',
                    transaction: updatedTransaction
                }
            });

        } catch (error) {
            console.error('Payment status update error:', error);
            res.status(500).json({
                errors: { error: { msg: 'Failed to update payment status' } }
            });
        }
    } else {
        res.status(405).json({
            errors: { error: { msg: `${method} method unsupported` } }
        });
    }
};

export default handler; 