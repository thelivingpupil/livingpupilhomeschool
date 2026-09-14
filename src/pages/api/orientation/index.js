import { validateSession } from '@/config/api-validation';
import { getOrientationForParent } from '@/prisma/services/orientation';
import { GradeLevel } from '@prisma/client';

const GRADE_LEVELS = Object.values(GradeLevel);

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ errors: { error: { msg: `${req.method} method unsupported` } } });
  }

  const session = await validateSession(req, res);
  if (!session) {
    return;
  }

  const { gradeLevel, schoolYear } = req.query;

  if (!gradeLevel || !schoolYear || !GRADE_LEVELS.includes(gradeLevel)) {
    return res.status(400).json({
      errors: { error: { msg: 'gradeLevel and schoolYear are required' } },
    });
  }

  try {
    const { videos, progress, allFinished } = await getOrientationForParent(
      session.user.userId,
      gradeLevel,
      schoolYear,
    );

    if (!videos.length) {
      return res.status(404).json({
        errors: {
          error: {
            msg: 'Orientation is not available for this grade level yet. Please contact Living Pupil Homeschool.',
          },
        },
      });
    }

    return res.status(200).json({ data: { videos, progress, allFinished } });
  } catch (error) {
    console.error('Error fetching orientation:', error);
    return res.status(500).json({
      errors: { error: { msg: 'Failed to fetch orientation video' } },
    });
  }
};

export default handler;
