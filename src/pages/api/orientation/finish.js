import { validateSession } from '@/config/api-validation';
import {
  OrientationError,
  finishOrientationProgress,
} from '@/prisma/services/orientation';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ errors: { error: { msg: `${req.method} method unsupported` } } });
  }

  const session = await validateSession(req, res);
  if (!session) {
    return;
  }

  const { orientationVideoId } = req.body || {};

  if (!orientationVideoId) {
    return res.status(400).json({
      errors: { error: { msg: 'orientationVideoId is required' } },
    });
  }

  try {
    const { video, progress } = await finishOrientationProgress(
      session.user.userId,
      orientationVideoId,
    );

    return res.status(200).json({ data: { video, progress } });
  } catch (error) {
    if (error instanceof OrientationError) {
      return res.status(error.statusCode).json({
        errors: { error: { msg: error.message } },
      });
    }

    console.error('Error finishing orientation:', error);
    return res.status(500).json({
      errors: { error: { msg: 'Failed to finish orientation' } },
    });
  }
};

export default handler;
