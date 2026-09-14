import { validateSession } from '@/config/api-validation';
import {
  OrientationError,
  createOrientationVideo,
  deleteOrientationVideo,
  getAllOrientationVideos,
  getReusableOrientationVideos,
  updateOrientationVideo,
} from '@/prisma/services/orientation';
import { GradeLevel } from '@prisma/client';

const GRADE_LEVELS = Object.values(GradeLevel);

const handler = async (req, res) => {
  const { method } = req;
  const session = await validateSession(req, res);

  if (!session || session.user?.userType !== 'ADMIN') {
    return res.status(403).json({
      errors: { error: { msg: 'Forbidden: Admin access required' } },
    });
  }

  if (method === 'GET') {
    try {
      const [videos, reusableVideos] = await Promise.all([
        getAllOrientationVideos(),
        getReusableOrientationVideos(),
      ]);

      return res.status(200).json({
        data: { videos, reusableVideos },
      });
    } catch (error) {
      console.error('Error fetching orientation videos:', error);
      return res.status(500).json({
        errors: { error: { msg: 'Failed to fetch orientation videos' } },
      });
    }
  }

  if (method === 'POST') {
    try {
      const {
        title,
        gradeLevels,
        gradeLevel,
        schoolYear,
        videoUrl,
        videoPath,
        requiredWatchSeconds,
        isActive,
      } = req.body;

      const selectedGrades = Array.isArray(gradeLevels)
        ? gradeLevels
        : gradeLevel
          ? [gradeLevel]
          : [];

      if (!title || !selectedGrades.length || !schoolYear || !videoUrl) {
        return res.status(400).json({
          errors: {
            error: {
              msg: 'title, gradeLevels, schoolYear, and videoUrl are required',
            },
          },
        });
      }

      if (selectedGrades.some((level) => !GRADE_LEVELS.includes(level))) {
        return res.status(400).json({
          errors: { error: { msg: 'Invalid grade level' } },
        });
      }

      const seconds = Number(requiredWatchSeconds);
      if (!Number.isFinite(seconds) || seconds <= 0) {
        return res.status(400).json({
          errors: {
            error: { msg: 'requiredWatchSeconds must be greater than 0' },
          },
        });
      }

      const video = await createOrientationVideo({
        title: title.trim(),
        gradeLevels: selectedGrades,
        schoolYear,
        videoUrl,
        videoPath,
        requiredWatchSeconds: Math.floor(seconds),
        isActive: isActive !== false,
      });

      return res.status(201).json({ data: { video } });
    } catch (error) {
      console.error('Error creating orientation video:', error);

      if (error.code === 'P2002') {
        return res.status(409).json({
          errors: {
            error: {
              msg: 'Could not save this orientation video. Please try again.',
            },
          },
        });
      }

      return res.status(500).json({
        errors: {
          error: { msg: error.message || 'Failed to create orientation video' },
        },
      });
    }
  }

  if (method === 'PUT') {
    try {
      const {
        id,
        title,
        gradeLevels,
        gradeLevel,
        schoolYear,
        videoUrl,
        videoPath,
        requiredWatchSeconds,
        isActive,
      } = req.body;

      if (!id) {
        return res.status(400).json({
          errors: { error: { msg: 'id is required' } },
        });
      }

      const selectedGrades = Array.isArray(gradeLevels)
        ? gradeLevels
        : gradeLevel
          ? [gradeLevel]
          : undefined;

      if (
        selectedGrades &&
        selectedGrades.some((level) => !GRADE_LEVELS.includes(level))
      ) {
        return res.status(400).json({
          errors: { error: { msg: 'Invalid grade level' } },
        });
      }

      if (selectedGrades && selectedGrades.length === 0) {
        return res.status(400).json({
          errors: { error: { msg: 'Select at least one grade level' } },
        });
      }

      const payload = {
        title,
        gradeLevels: selectedGrades,
        schoolYear,
        videoUrl,
        videoPath,
        isActive,
      };

      if (requiredWatchSeconds !== undefined) {
        const seconds = Number(requiredWatchSeconds);
        if (!Number.isFinite(seconds) || seconds <= 0) {
          return res.status(400).json({
            errors: {
              error: { msg: 'requiredWatchSeconds must be greater than 0' },
            },
          });
        }
        payload.requiredWatchSeconds = Math.floor(seconds);
      }

      const video = await updateOrientationVideo(id, payload);

      return res.status(200).json({ data: { video } });
    } catch (error) {
      console.error('Error updating orientation video:', error);

      if (error instanceof OrientationError) {
        return res.status(error.statusCode).json({
          errors: { error: { msg: error.message } },
        });
      }

      if (error.code === 'P2002') {
        return res.status(409).json({
          errors: {
            error: {
              msg: 'Could not save this orientation video. Please try again.',
            },
          },
        });
      }

      return res.status(500).json({
        errors: {
          error: { msg: error.message || 'Failed to update orientation video' },
        },
      });
    }
  }

  if (method === 'DELETE') {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          errors: { error: { msg: 'id is required' } },
        });
      }

      await deleteOrientationVideo(id);

      return res.status(200).json({
        data: { message: 'Orientation video deleted successfully' },
      });
    } catch (error) {
      console.error('Error deleting orientation video:', error);
      return res.status(500).json({
        errors: { error: { msg: 'Failed to delete orientation video' } },
      });
    }
  }

  return res
    .status(405)
    .json({ errors: { error: { msg: `${method} method unsupported` } } });
};

export default handler;
