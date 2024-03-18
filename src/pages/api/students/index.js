import { validateSession } from '@/config/api-validation';
import { getStudentRecords } from '@/prisma/services/student-record';
import { deleteStudentRecord, getStudentRecord, updateStudentRecord} from '@/prisma/services/student-record';
import { deleteStudentWorkspace } from '@/prisma/services/workspace';

const ALLOW_DELETION = true;

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    await validateSession(req, res);
    const students = await getStudentRecords();
    res.status(200).json({ data: { students } });
  } else if (method === 'PUT') {
    const { studentId, firstName, middleName, lastName, gender, religion, enrollmentType, incomingGradeLevel, schoolYear, birthDate, pictureLink, birthCertificateLink, reportCardLink } = req.body;
    
    if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
    }
    
    try {
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
            //discountCode,
        };
        console.log('Updating student record:', studentId, studentNewData); // Logging to check the data
        await updateStudentRecord(studentId, studentNewData);
        res.status(200).json({ message: 'Student record updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update student record' });
    }
  } else if (method === 'DELETE') {
    // Logic to handle DELETE request (deactivate account)
    const {inviteCode, studentId} = req.body;
    
    if (!studentId) {
      return res.status(400).json({ error: 'student ID is required' });
    }
    if (ALLOW_DELETION) {
      await Promise.all([
        deleteStudentWorkspace(inviteCode),
        deleteStudentRecord(studentId)
      ]);
      res.status(200).json({ data: { studentId } });
    } else {
      res.status(403).json({ error: 'Student Deletion is not allowed' });
    }
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
