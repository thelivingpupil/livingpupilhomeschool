import { validateSession } from '@/config/api-validation';
import { getSchoolFeeByStudentIdAndOrder } from '@/prisma/services/school-fee';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Require authentication to access school fees
    const session = await validateSession(req, res);

    const { studentId, order } = req.query;

    // Convert order to an integer
    const orderInt = parseInt(order);

    try {
      const schoolFees = await getSchoolFeeByStudentIdAndOrder(studentId, orderInt);
      res.status(200).json(schoolFees);
    } catch (error) {
      console.error('Error fetching school fees:', error);
      res.status(500).json({ errors: { error: { msg: 'Internal Server Error' } } });
    }
  } else {
    res.status(405).json({ errors: { error: { msg: 'Method Not Allowed' } } });
  }
}
