import { validateSession } from '@/config/api-validation';
import {
  OrientationError,
  startOrientationProgress,
} from '@/prisma/services/orientation';
import { GradeLevel } from '@prisma/client';

const GRADE_LEVELS = Object.values(GradeLevel);

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

  const { orientationVideoId, gradeLevel, schoolYear } = req.body || {};

  if (
    !orientationVideoId ||
    !gradeLevel ||
    !schoolYear ||
    !GRADE_LEVELS.includes(gradeLevel)
  ) {
    return res.status(400).json({
      errors: {
        error: {
          msg: 'orientationVideoId, gradeLevel, and schoolYear are required',
        },
      },
    });
  }

  try {
    const { video, progress } = await startOrientationProgress(
      session.user.userId,
      orientationVideoId,
      gradeLevel,
      schoolYear,
    );

    return res.status(200).json({ data: { video, progress } });
  } catch (error) {
    if (error instanceof OrientationError) {
      return res.status(error.statusCode).json({
        errors: { error: { msg: error.message } },
      });
    }

    console.error('Error starting orientation:', error);
    return res.status(500).json({
      errors: { error: { msg: 'Failed to start orientation' } },
    });
  }
};

export default handler;
