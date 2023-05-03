import { validateSession } from '@/config/api-validation';
import { html, text } from '@/config/email-templates/enrollment';
import { sendMail } from '@/lib/server/mail';
import { createSchoolFees } from '@/prisma/services/school-fee';
import { createStudentRecord } from '@/prisma/services/student-record';
import { updateGuardianInformation } from '@/prisma/services/user';
import { createWorkspaceWithSlug } from '@/prisma/services/workspace';
import sanityClient from '@/lib/server/sanity';
import { GradeLevel, Program } from '@prisma/client';
import { GRADE_LEVEL_TYPES } from '@/utils/constants';

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
      discountCode,
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

    let gradeLevel = incomingGradeLevel;

    if (program === Program.HOMESCHOOL_COTTAGE) {
      if (
        [GradeLevel.GRADE_1, GradeLevel.GRADE_2, GradeLevel.GRADE_3].includes(
          incomingGradeLevel
        )
      ) {
        gradeLevel = GRADE_LEVEL_TYPES.FORM_1;
      }

      if (
        [GradeLevel.GRADE_4, GradeLevel.GRADE_5, GradeLevel.GRADE_6].includes(
          incomingGradeLevel
        )
      ) {
        gradeLevel = GRADE_LEVEL_TYPES.FORM_2;
      }

      if (
        [
          GradeLevel.GRADE_7,
          GradeLevel.GRADE_8,
          GradeLevel.GRADE_9,
          GradeLevel.GRADE_10,
        ].includes(incomingGradeLevel)
      ) {
        gradeLevel = GRADE_LEVEL_TYPES.FORM_3;
      }
    }

    const programFee = await sanityClient.fetch(
      `*[_type == 'programs' && gradeLevel == $gradeLevel && accreditation == $accreditation && programType == $program && enrollmentType == $enrollmentType && cottageType == $cottageType]{...}`,
      {
        accreditation,
        enrollmentType,
        gradeLevel,
        program,
        cottageType,
      }
    );

    console.log('programFee', programFee);
    // const workspace = await createWorkspaceWithSlug(
    //   session.user.userId,
    //   session.user.email,
    //   `${firstName} ${lastName}`,
    //   slug
    // );
    // const [studentRecord, schoolFee] = await Promise.all([
    //   createStudentRecord(
    //     workspace.id,
    //     firstName,
    //     middleName,
    //     lastName,
    //     birthDate,
    //     gender,
    //     religion,
    //     incomingGradeLevel,
    //     enrollmentType,
    //     program,
    //     accreditation,
    //     reason,
    //     formerSchoolName,
    //     formerSchoolAddress,
    //     pictureLink,
    //     birthCertificateLink,
    //     reportCardLink,
    //     discountCode
    //   ),
    //   createSchoolFees(
    //     session.user.userId,
    //     session.user.email,
    //     workspace.id,
    //     payment,
    //     enrollmentType,
    //     incomingGradeLevel,
    //     program,
    //     accreditation,
    //     paymentMethod,
    //     discountCode
    //   ),
    //   updateGuardianInformation(session.user.userId, guardianInformation),
    // ]);
    // await sendMail({
    //   html: html({
    //     accreditation,
    //     birthCertificateLink,
    //     enrollmentType,
    //     firstName,
    //     incomingGradeLevel,
    //     payment,
    //     paymentMethod,
    //     pictureLink,
    //     program,
    //     reportCardLink,
    //     schoolFee,
    //   }),
    //   subject: `[Living Pupil Homeschool] Received ${firstName}'s Student Record`,
    //   text: text({
    //     accreditation,
    //     birthCertificateLink,
    //     enrollmentType,
    //     firstName,
    //     incomingGradeLevel,
    //     payment,
    //     paymentMethod,
    //     pictureLink,
    //     program,
    //     reportCardLink,
    //     schoolFee,
    //   }),
    //   to: [session.user.email],
    // });
    // res.status(200).json({ data: { studentRecord, schoolFee } });
    res.status(200).json({ data: { message: 'success' } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
