import { validateSession } from '@/config/api-validation';
import { getSchoolFees } from '@/prisma/services/school-fee';


const handler = async (req, res) => {
    const { method } = req;

    if (method === 'GET') {
        await validateSession(req, res);
        const schoolFees = await getSchoolFees();
        res.status(200).json({ data: { schoolFees } });
    } else {
        res.status(405).json({ error: `${method} method unsupported` });
    }
};

export default handler;
