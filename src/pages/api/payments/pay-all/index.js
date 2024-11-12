import { validateSession } from '@/config/api-validation';
import { createPayAllFees } from '@/prisma/services/school-fee';
import { renewOldTransaction } from '@/prisma/services/transaction';

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'PATCH') {
        const session = await validateSession(req, res);
        const {
            transactionId,
            amount,
            description,
            source
        } = req.body;

        const transaction = await renewOldTransaction(session.user.email,
            transactionId,
            amount,
            description,
            source)

        console.log(transaction)

        res.status(200).json({
            message: 'School fees renewed successfully',
            data: {
                paymentLink: transaction.url, // Ensure `url` is accessible here
                referenceNumber: transaction.referenceNumber
            }
        });

    } else if (method === 'POST') {
        const session = await validateSession(req, res);
        const {
            studentId,
            incomingGradeLevel,
            amount
        } = req.body;

        const schoolFee = await createPayAllFees(
            session.user.userId,
            session.user.email,
            studentId,
            'PAY_ALL',
            incomingGradeLevel,
            'ONLINE',
            amount
        )

        res.status(200).json({
            message: 'School fees generated successfully',
            data: {
                paymentLink: schoolFee.url, // Ensure `url` is accessible here
                referenceNumber: schoolFee.referenceNumber
            }
        });
    } else {
        res.status(405).json({ error: `${method} method unsupported` });
    }
};

export default handler;