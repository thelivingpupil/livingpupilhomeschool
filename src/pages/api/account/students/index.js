import { validateSession } from '@/config/api-validation';
import { getParentStudentSummaries } from '@/prisma/services/parent-students';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `${req.method} method unsupported` });
  }

  try {
    const session = await validateSession(req, res);
    const students = await getParentStudentSummaries(
      session.user.userId,
      session.user.email
    );
    return res.status(200).json({ data: { students } });
  } catch (e) {
    throw e;
  }
};

export default handler;
