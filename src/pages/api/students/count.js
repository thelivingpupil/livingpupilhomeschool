import { validateSession } from '@/config/api-validation';
import {
  countEnrolledStudents,
  countEnrolledStudentsByGradeLevel,
  countEnrolledStudentsByProgram,
  countStudents,
} from '@/prisma/services/student-record';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    await validateSession(req, res);
    const total = await countStudents();
    const enrolled = await countEnrolledStudents();
    const gradeLevelGroup = await countEnrolledStudentsByGradeLevel();
    const programGroup = await countEnrolledStudentsByProgram();
    res
      .status(200)
      .json({ data: { enrolled, total, gradeLevelGroup, programGroup } });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
