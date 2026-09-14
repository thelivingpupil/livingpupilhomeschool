import { validateSession } from '@/config/api-validation';
import { getAllOrientationProgress } from '@/prisma/services/orientation';

const handler = async (req, res) => {
  const session = await validateSession(req, res);

  if (!session || session.user?.userType !== 'ADMIN') {
    return res.status(403).json({
      errors: { error: { msg: 'Forbidden: Admin access required' } },
    });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      errors: { error: { msg: `${req.method} method unsupported` } },
    });
  }

  try {
    const progress = await getAllOrientationProgress();
    return res.status(200).json({ data: { progress } });
  } catch (error) {
    console.error('Error fetching orientation progress:', error);
    return res.status(500).json({
      errors: { error: { msg: 'Failed to fetch orientation progress' } },
    });
  }
};

export default handler;
