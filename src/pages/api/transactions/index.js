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
    await validateSession(req, res);
    const transactions = await getTransactions();
    res.status(200).json({ data: { transactions } });
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
