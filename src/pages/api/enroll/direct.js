import { validateSession } from '@/config/api-validation';
import { html, text } from '@/config/email-templates/enrollment-received';
import {
  html as recordHtml,
  text as recordText,
} from '@/config/email-templates/enrollment-update';
import {
  html as policiesHtml,
  text as policiesText,
} from '@/config/email-templates/enrollment-update';
import { sendMail } from '@/lib/server/mail';
import { createSchoolFees } from '@/prisma/services/school-fee';
import { createStudentRecord } from '@/prisma/services/student-record';
import { updateGuardianInformation } from '@/prisma/services/user';
import { createWorkspaceWithSlug } from '@/prisma/services/workspace';
import { SCHOOL_YEAR } from '@/utils/constants';
import { STUDENT_STATUS } from '@/utils/constants';

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
      discountCode,
      primaryTeacherName,
      primaryTeacherAge,
      primaryTeacherRelationship,
      primaryTeacherEducation,
      primaryTeacherProfile,
      monthIndex,
      signatureLink
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

    const getParentName = (str) => {
      str = str.trim();
      if (str === '') return '';

      const words = str.split(/\s+/);
      const lastWord = words[words.length - 1];
      return lastWord.replace(/[.,?!;:]$/, ''); // Remove common punctuation
    };

    const parentName = getParentName(primaryGuardianName);

    const workspace = await createWorkspaceWithSlug(
      session.user.userId,
      session.user.email,
      `${firstName} ${lastName} ${schoolYear}`,
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
        discountCode,
        primaryTeacherName,
        primaryTeacherAge,
        primaryTeacherRelationship,
        primaryTeacherEducation,
        primaryTeacherProfile,
        STUDENT_STATUS.PENDING,
        signatureLink
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
        paymentMethod,
        discountCode,
        monthIndex,
      ),
      updateGuardianInformation(session.user.userId, guardianInformation),
    ]);
    const url = schoolFee.url;
    await sendMail({
      html: html({
        parentName,
        firstName,
      }),
      subject: `Enrollment Form Received - Verification in Progress!`,
      text: text({
        parentName,
        firstName,
      }),
      to: [session.user.email],
    });
    const attachments = [
      {
        filename: 'Payment Policies.pdf',
        path: 'public/files/Payment_Policies.pdf' // Ensure this path is correct and accessible
      },
      {
        filename: 'Homeschool_Agreement.pdf',
        path: 'public/files/Homeschool_Agreement.pdf' // Example of another attachment
      }
    ];
    await sendMail({
      html: policiesHtml({
        parentName,
      }),
      subject: `[Living Pupil Homeschool] Signed Homeschool Agreement and Payment Policy`,
      text: policiesText({
        parentName,
      }),
      to: [session.user.email],
      attachments,
    });
    await sendMail({
      html: recordHtml({
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
        url,
        primaryGuardianName,
      }),
      subject: `[Living Pupil Homeschool] Received ${firstName} Student Record`,
      text: recordText({
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
        url,
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
