import { validateSession } from '@/config/api-validation';
import { createSchoolFees } from '@/prisma/services/school-fee';
import { createStudentRecord } from '@/prisma/services/student-record';
import { getOwnWorkspace } from '@/prisma/services/workspace';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'POST') {
    const session = await validateSession(req, res);
    const {
      firstName,
      middleName,
      lastName,
      gender,
      religion,
      reason,
      enrollmentType,
      incomingGradeLevel,
      formerSchoolName,
      formerSchoolAddress,
      program,
      accreditation,
      birthDate,
      payment,
      paymentMethod,
      pictureLink,
      birthCertificateLink,
      reportCardLink,
      slug,
    } = req.body;
    const workspace = await getOwnWorkspace(
      session.user.userId,
      session.user.email,
      slug
    );
    const [studentRecord, schoolFee] = await Promise.all([
      createStudentRecord(
        workspace.id,
        firstName,
        middleName,
        lastName,
        birthDate,
        gender,
        religion,
        incomingGradeLevel,
        enrollmentType,
        program,
        accreditation,
        reason,
        formerSchoolName,
        formerSchoolAddress,
        pictureLink,
        birthCertificateLink,
        reportCardLink
      ),
      createSchoolFees(
        session.user.userId,
        session.user.email,
        workspace.id,
        payment,
        enrollmentType,
        incomingGradeLevel,
        program,
        accreditation,
        paymentMethod
      ),
    ]);
    res.status(200).json({ data: { studentRecord, schoolFee } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
