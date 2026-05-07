import { validateSession } from '@/config/api-validation';
import { listSchoolYearsV2 } from '@/prisma/services/parent-students';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: `${req.method} method unsupported` });
  }

  try {
    const session = await validateSession(req, res);
    if (res.headersSent) return;

    const schoolYears = await listSchoolYearsV2(session.user.userId);
    return res.status(200).json({ data: { schoolYears } });
  } catch (e) {
    throw e;
  }
};

export default handler;
