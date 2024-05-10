import { validateSession } from '@/config/api-validation';
import { getTransactions } from '@/prisma/services/transaction';
import { createSchoolFees, deleteStudentSchoolFees } from '@/prisma/services/school-fee';

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
      studentId
    } = req.body;
    // Delete existing school fees
    await deleteStudentSchoolFees(studentId);

    const [schoolFee] = await Promise.all([
      createSchoolFees(
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
        scholarshipCode
      ),
    ]);
    res.status(200).json({ message: 'School fees generated successfully', schoolFee });

  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
