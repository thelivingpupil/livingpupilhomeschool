import { validateSession } from '@/config/api-validation';
import { getStudentSchoolYearsForParent } from '@/prisma/services/parent-students';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `${req.method} method unsupported` });
  }

  const { studentKey } = req.query;
  if (!studentKey || typeof studentKey !== 'string') {
    return res.status(400).json({ error: 'Missing studentKey' });
  }

  try {
    const session = await validateSession(req, res);
    const result = await getStudentSchoolYearsForParent(
      session.user.userId,
      session.user.email,
      studentKey
    );

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Student not found' });
    }

    return res.status(200).json({ data: result });
  } catch (e) {
    throw e;
  }
};

export default handler;
