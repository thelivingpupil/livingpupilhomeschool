import { validateSession } from '@/config/api-validation';
import { getTransactions } from '@/prisma/services/transaction';
import {
  createSchoolFees,
  deleteStudentSchoolFees,
} from '@/prisma/services/school-fee';
import { updateStudentRecordForSchoolFees } from '@/prisma/services/student-record';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    try {
      await validateSession(req, res);

      // Extract query parameters
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const filterBy = req.query.filterBy && req.query.filterBy !== 'null' ? req.query.filterBy : null;
      const filterValue = req.query.filterValue && req.query.filterValue !== 'null' && req.query.filterValue !== '' ? req.query.filterValue : null;

      const result = await getTransactions({
        page,
        pageSize,
        filterBy,
        filterValue,
      });

      res.status(200).json({
        data: {
          transactions: result.transactions || [],
          pagination: result.pagination || { total: 0, page: 1, pageSize: 10, totalPages: 0 },
        },
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({
        error: 'Failed to fetch transactions',
        message: error.message,
      });
    }
  } else if (method === 'POST') {
    const {
      userId,
      email,
      workspaceId,
      payment,
      enrollmentType,
      incomingGradeLevel,
      program,
      cottageType,
      accreditation,
      paymentMethod,
      discountCode,
      scholarshipCode,
      studentId,
      monthIndex,
    } = req.body;
    // Delete existing school fees
    await deleteStudentSchoolFees(studentId);
    const [studentRecord, schoolFee] = await Promise.all([
      updateStudentRecordForSchoolFees(
        studentId,
        incomingGradeLevel,
        enrollmentType,
        accreditation,
        discountCode,
        scholarshipCode,
        program,
        cottageType
      ),
      createSchoolFees(
        userId,
        email,
        studentId,
        payment,
        enrollmentType,
        incomingGradeLevel,
        program,
        cottageType,
        accreditation,
        paymentMethod,
        discountCode,
        monthIndex,
        scholarshipCode
      ),
    ]);
    res
      .status(200)
      .json(
        { message: 'School fees generated successfully' },
        { data: { studentRecord, schoolFee } }
      );
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
