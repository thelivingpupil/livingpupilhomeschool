import { validateSession } from '@/config/api-validation';
import {
  getPendingSales,
  getTotalEnrollmentRevenuesByStatus,
  getTotalSales,
  getTotalStoreRevenuesByStatus,
} from '@/prisma/services/transaction';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    await validateSession(req, res);
    const totalSales = await getTotalSales();
    const pendingSales = await getPendingSales();
    const enrollmentSales = await getTotalEnrollmentRevenuesByStatus();
    const storeSales = await getTotalStoreRevenuesByStatus();
    res
      .status(200)
      .json({
        data: { totalSales, pendingSales, enrollmentSales, storeSales },
      });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
