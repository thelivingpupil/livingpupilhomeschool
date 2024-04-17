import { validateSession } from '@/config/api-validation';
import { getSchoolFeeByStudentIdAndOrder } from '@/prisma/services/school-fee';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { studentId, order } = req.query;

    // Convert order to an integer
    const orderInt = parseInt(order);

    try {
      const schoolFees = await getSchoolFeeByStudentIdAndOrder(studentId, orderInt);
      res.status(200).json(schoolFees);
    } catch (error) {
      console.error('Error fetching school fees:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
