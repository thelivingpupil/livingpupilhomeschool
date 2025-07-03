import { getSession } from 'next-auth/react';
import { getAffiliateDataPerYear } from '@/prisma/services/user';

const handler = async (req, res) => {
    const { method } = req;

    if (method === 'GET') {
        try {
            console.log('API: Starting affiliate data fetch...');

            const session = await getSession({ req });
            console.log('API: Session check completed');

            if (!session || session.user?.userType !== 'ADMIN') {
                console.log('API: Unauthorized access attempt');
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { year } = req.query;
            const selectedYear = parseInt(year) || new Date().getFullYear();
            console.log('API: Fetching data for year:', selectedYear);

            console.log('API: Calling getAffiliateDataPerYear...');
            const affiliateData = await getAffiliateDataPerYear(selectedYear);
            console.log('API: Data fetched successfully, count:', affiliateData?.length || 0);

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