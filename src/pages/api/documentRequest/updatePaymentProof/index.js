import { validateSession } from '@/config/api-validation';
import prisma from '@/prisma/index';

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'POST') {
        try {
            await validateSession(req, res);
            const { transactionId, paymentProofUrl } = req.body;

            if (!transactionId || !paymentProofUrl) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction ID and payment proof URL are required.',
                });
            }

            // Update the transaction with payment proof
            const updatedTransaction = await prisma.transaction.update({
                where: {
                    transactionId: transactionId,
                },
                data: {
                    paymentProofLink: paymentProofUrl,
                    paymentStatus: 'V', // Set to verification status
                    updatedAt: new Date(),
                },
            });

            res.status(200).json({
                success: true,
                message: 'Payment proof uploaded successfully.',
                data: {
                    transaction: updatedTransaction,
                },
            });
        } catch (error) {
            console.error('Error updating payment proof:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update payment proof.',
            });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
};

export default handler; 