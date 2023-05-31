import { validateSession } from '@/config/api-validation';
import {
  countEnrolledStudents,
  countEnrolledStudentsByGradeLevel,
  countEnrolledStudentsByProgram,
  countStudents,
} from '@/prisma/services/student-record';

const handler = async (req, res) => {
  const { method, query } = req;

  const { startDate, endDate } = query || {};

  if (method === 'GET') {
    await validateSession(req, res);
    const total = await countStudents(startDate, endDate);
    const enrolled = await countEnrolledStudents(startDate, endDate);
    const gradeLevelGroup = await countEnrolledStudentsByGradeLevel(
      startDate,
      endDate
    );
    const programGroup = await countEnrolledStudentsByProgram(
      startDate,
      endDate
    );
    res
      .status(200)
      .json({ data: { enrolled, total, gradeLevelGroup, programGroup } });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
