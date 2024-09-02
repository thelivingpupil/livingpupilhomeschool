import { validateSession } from '@/config/api-validation';
import { getStoreOrders } from '@/prisma/services/shop';

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'GET') {
        await validateSession(req, res);
        const orders = await getStoreOrders();
        res.status(200).json({ data: { orders } });
    } else {
        res.status(405).json({ error: `${method} method unsupported` });
    }
};

export default handler;
