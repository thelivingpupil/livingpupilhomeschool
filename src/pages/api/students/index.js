import { validateSession } from '@/config/api-validation';
import { getStudentRecords } from '@/prisma/services/student-record';
import { deleteStudentRecord, updateStudentRecord } from '@/prisma/services/student-record';
import { sendMail } from '@/lib/server/mail';
import { html, text } from '@/config/email-templates/workspace-create';
import { deleteStudentWorkspace } from '@/prisma/services/workspace';

const ALLOW_DELETION = true;

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    await validateSession(req, res);
    const students = await getStudentRecords();
    res.status(200).json({ data: { students } });
  } else if (method === 'PUT') {
    try {
      // Require authentication and ADMIN role for updating student records
      const session = await validateSession(req, res);

      if (!session || session.user?.userType !== 'ADMIN') {
        return res.status(403).json({ errors: { error: { msg: 'Forbidden: Admin access required' } } });
      }

      const {
        studentId,
        firstName,
        middleName,
        lastName,
        gender,
        religion,
        enrollmentType,
        incomingGradeLevel,
        schoolYear,
        birthDate,
        pictureLink,
        birthCertificateLink,
        reportCardLink,
        discountCode,
        accreditation,
        scholarshipCode,
        email,
        idPictureFront,
        idPictureBack,
      } = req.body;
      if (!studentId) {
        return res.status(400).json({ errors: { error: { msg: 'Student ID is required' } } });
      }
      const studentNewData = {
        firstName,
        middleName,
        lastName,
        gender,
        religion,
        enrollmentType,
        incomingGradeLevel,
        schoolYear,
        birthDate,
        pictureLink,
        birthCertificateLink,
        reportCardLink,
        discountCode,
        accreditation,
        scholarshipCode,
        idPictureFront,
        idPictureBack,
      };
      // update student records
      const [studentRecord] = await Promise.all([
        updateStudentRecord(studentId, studentNewData),
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
        subject: `[Living Pupil Homeschool] Updated ${firstName}'s Student Record`,
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
        to: [email],
      });
      res.status(200).json({ message: 'Student record updated successfully' });
    } catch (error) {
      console.error('Error updating student record:', error);
      res.status(500).json({ errors: { error: { msg: 'Failed to update student record' } } });
    }
  } else if (method === 'DELETE') {
    try {
      // Require authentication and ADMIN role for deleting student records
      const session = await validateSession(req, res);

      if (!session || session.user?.userType !== 'ADMIN') {
        return res.status(403).json({ errors: { error: { msg: 'Forbidden: Admin access required' } } });
      }

      const { inviteCode, studentId } = req.body;

      if (!studentId) {
        return res.status(400).json({ errors: { error: { msg: 'Student ID is required' } } });
      }
      if (ALLOW_DELETION) {
        await Promise.all([
          deleteStudentWorkspace(inviteCode),
          deleteStudentRecord(studentId)
        ]);
        res.status(200).json({ data: { studentId } });
      } else {
        res.status(403).json({ errors: { error: { msg: 'Student Deletion is not allowed' } } });
      }
    } catch (error) {
      console.error('Error deleting student record:', error);
      res.status(500).json({ errors: { error: { msg: 'Failed to delete student record' } } });
    }
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
