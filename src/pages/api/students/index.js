import { validateSession } from '@/config/api-validation';
import { getStudentRecords } from '@/prisma/services/student-record';
import { deleteStudentRecord, getStudentRecord } from '@/prisma/services/student-record';

const ALLOW_DELETION = true;

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    await validateSession(req, res);
    const students = await getStudentRecords();
    res.status(200).json({ data: { students } });
  } else if (method === 'DELETE') {
    // Logic to handle DELETE request (deactivate account)
    const {studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ error: 'student ID is required' });
    }
    if (ALLOW_DELETION) {
      await deleteStudentRecord(studentId);
      res.status(200).json({ data: { studentId } });
    } else {
      res.status(403).json({ error: 'Student Deletion is not allowed' });
    }
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
