import { validateSession } from '@/config/api-validation';
import {
  getPendingSales,
  getTotalEnrollmentRevenuesByStatus,
  getTotalSales,
  getTotalStoreRevenuesByStatus,
} from '@/prisma/services/transaction';

const handler = async (req, res) => {
  const { method, query } = req;

  const { startDate, endDate } = query || {};

  if (method === 'GET') {
    await validateSession(req, res);
    const totalSales = await getTotalSales(startDate, endDate);
    const pendingSales = await getPendingSales(startDate, endDate);
    const enrollmentSales = await getTotalEnrollmentRevenuesByStatus(
      startDate,
      endDate
    );
    const storeSales = await getTotalStoreRevenuesByStatus(startDate, endDate);
    res.status(200).json({
      data: { totalSales, pendingSales, enrollmentSales, storeSales },
    });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
