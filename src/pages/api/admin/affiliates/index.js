import { getSession } from 'next-auth/react';
import { getAffiliateDataPerYear } from '@/prisma/services/user';

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'GET') {
        try {
            const session = await getSession({ req });

            if (!session || session.user?.userType !== 'ADMIN') {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { year } = req.query;
            const selectedYear = parseInt(year) || new Date().getFullYear();

            const affiliateData = await getAffiliateDataPerYear(selectedYear);

            return res.status(200).json({
                data: affiliateData,
                year: selectedYear
            });
        } catch (error) {
            console.error('API: Error fetching affiliate data:', error);
            console.error('API: Error stack:', error.stack);
            return res.status(500).json({
                error: 'Internal server error',
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    } else {
        res.status(405).json({ error: `${method} method unsupported` });
    }
};

export default handler; 