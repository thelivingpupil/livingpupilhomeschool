import { validateSession } from '@/config/api-validation';
import { getUserOrderFees } from '@/prisma/services/shop';

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'GET') {
        const session = await validateSession(req, res);
        const orderFees = await getUserOrderFees(session.user.userId);
        res.status(200).json({ data: { orderFees } });
    } else {
        res.status(405).json({ error: `${method} method unsupported` });
    }
};

export default handler;
