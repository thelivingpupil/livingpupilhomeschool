import { validateSession } from '@/config/api-validation';
import { getStudentRecords } from '@/prisma/services/student-record';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    await validateSession(req, res);
    const students = await getStudentRecords();
    res.status(200).json({ data: { students } });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
