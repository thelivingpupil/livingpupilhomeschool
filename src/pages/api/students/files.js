import { validateSession } from '@/config/api-validation/index';
import { updateFile } from '@/prisma/services/student-record';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'PUT') {
    await validateSession(req, res);
    const { type, studentId, url } = req.body;
    await updateFile(studentId, type, url);
    res.status(200).json({ data: { studentId } });
  } else {
    res
      .status(405)
      .json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;
