import { validateSession } from '@/config/api-validation';
import { html, text } from '@/config/email-templates/enrollment';
import { sendMail } from '@/lib/server/mail';
import { createSchoolFees } from '@/prisma/services/school-fee';
import { createStudentRecord } from '@/prisma/services/student-record';
import { updateGuardianInformation } from '@/prisma/services/user';
import { getOwnWorkspace } from '@/prisma/services/workspace';
//import { SCHOOL_YEAR } from '@/utils/constants';

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
      schoolYear,
      formerSchoolName,
      formerSchoolAddress,
      program,
      cottageType,
      accreditation,
      birthDate,
      payment,
      paymentMethod,
      pictureLink,
      birthCertificateLink,
      reportCardLink,
      slug,
      primaryGuardianName,
      primaryGuardianOccupation,
      primaryGuardianType,
      primaryGuardianProfile,
      secondaryGuardianName,
      secondaryGuardianOccupation,
      secondaryGuardianType,
      secondaryGuardianProfile,
      mobileNumber,
      telephoneNumber,
      anotherEmail,
      address1,
      address2,
      discount,
    } = req.body;
    const guardianInformation = {
      primaryGuardianName,
      primaryGuardianOccupation,
      primaryGuardianType,
      primaryGuardianProfile,
      secondaryGuardianName,
      secondaryGuardianOccupation,
      secondaryGuardianType,
      secondaryGuardianProfile,
      mobileNumber,
      telephoneNumber,
      anotherEmail,
      address1,
      address2,
    };
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
        cottageType,
        accreditation,
        schoolYear,
        reason,
        formerSchoolName,
        formerSchoolAddress,
        pictureLink,
        birthCertificateLink,
        reportCardLink,
        discount
      ),
      createSchoolFees(
        session.user.userId,
        session.user.email,
        workspace.id,
        payment,
        enrollmentType,
        incomingGradeLevel,
        program,
        cottageType,
        accreditation,
        paymentMethod
      ),
      updateGuardianInformation(session.user.userId, guardianInformation),
    ]);
    await sendMail({
      html: html({
        accreditation,
        birthCertificateLink,
        enrollmentType,
        firstName,
        incomingGradeLevel,
        payment,
        paymentMethod,
        pictureLink,
        program,
        reportCardLink,
        schoolFee,
      }),
      subject: `[Living Pupil Homeschool] Received ${firstName}'s Student Record`,
      text: text({
        accreditation,
        birthCertificateLink,
        enrollmentType,
        firstName,
        incomingGradeLevel,
        payment,
        paymentMethod,
        pictureLink,
        program,
        reportCardLink,
        schoolFee,
      }),
      to: [session.user.email],
    });
    res.status(200).json({ data: { studentRecord, schoolFee } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
