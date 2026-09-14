import prisma from '@/prisma/index';
import { ORIENTATION_STATUS } from '@/utils/constants';

const progressSelect = {
  id: true,
  userId: true,
  orientationVideoId: true,
  gradeLevel: true,
  schoolYear: true,
  status: true,
  watchedSeconds: true,
  startedAt: true,
  finishedAt: true,
  createdAt: true,
  updatedAt: true,
};

const videoSelect = {
  id: true,
  title: true,
  schoolYear: true,
  videoUrl: true,
  videoPath: true,
  requiredWatchSeconds: true,
  isActive: true,
  createdAt: true,
  deletedAt: true,
  updatedAt: true,
  gradeLevels: {
    select: {
      gradeLevel: true,
    },
  },
};

const serializeVideo = (video) => {
  if (!video) {
    return null;
  }

  return {
    ...video,
    gradeLevels: (video.gradeLevels || []).map((item) => item.gradeLevel),
  };
};

export class OrientationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'OrientationError';
    this.statusCode = statusCode;
  }
}

export const getActiveOrientationVideos = async (gradeLevel, schoolYear) => {
  const videos = await prisma.orientationVideo.findMany({
    where: {
      schoolYear,
      isActive: true,
      deletedAt: null,
      gradeLevels: {
        some: {
          gradeLevel,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    select: videoSelect,
  });

  return videos.map(serializeVideo);
};

const assertVideoForGrade = async (orientationVideoId, gradeLevel, schoolYear) => {
  const video = await prisma.orientationVideo.findFirst({
    where: {
      id: orientationVideoId,
      schoolYear,
      isActive: true,
      deletedAt: null,
      gradeLevels: {
        some: {
          gradeLevel,
        },
      },
    },
    select: videoSelect,
  });

  if (!video) {
    throw new OrientationError(
      'Orientation is not available for this grade level yet.',
      404,
    );
  }

  return serializeVideo(video);
};

export const getOrientationForParent = async (userId, gradeLevel, schoolYear) => {
  const videos = await getActiveOrientationVideos(gradeLevel, schoolYear);
  if (!videos.length) {
    return { videos: [], progress: [], allFinished: false };
  }

  const progress = await prisma.orientationProgress.findMany({
    where: {
      userId,
      orientationVideoId: {
        in: videos.map((video) => video.id),
      },
    },
    select: progressSelect,
  });

  const finishedIds = new Set(
    progress
      .filter((item) => item.status === ORIENTATION_STATUS.FINISHED)
      .map((item) => item.orientationVideoId),
  );
  const allFinished = videos.every((video) => finishedIds.has(video.id));

  return { videos, progress, allFinished };
};

export const startOrientationProgress = async (
  userId,
  orientationVideoId,
  gradeLevel,
  schoolYear,
) => {
  const video = await assertVideoForGrade(
    orientationVideoId,
    gradeLevel,
    schoolYear,
  );

  const existing = await prisma.orientationProgress.findUnique({
    where: {
      userId_orientationVideoId: {
        userId,
        orientationVideoId,
      },
    },
    select: progressSelect,
  });

  if (existing) {
    return { video, progress: existing };
  }

  const progress = await prisma.orientationProgress.create({
    data: {
      userId,
      orientationVideoId,
      gradeLevel,
      schoolYear,
      status: ORIENTATION_STATUS.STARTED,
      watchedSeconds: 0,
    },
    select: progressSelect,
  });

  return { video, progress };
};

export const updateOrientationWatchedSeconds = async (
  userId,
  orientationVideoId,
  watchedSeconds,
) => {
  const existing = await prisma.orientationProgress.findUnique({
    where: {
      userId_orientationVideoId: {
        userId,
        orientationVideoId,
      },
    },
    select: progressSelect,
  });

  if (!existing) {
    throw new OrientationError('Please start the orientation video first.', 400);
  }

  const video = await prisma.orientationVideo.findUnique({
    where: { id: orientationVideoId },
    select: videoSelect,
  });

  if (existing.status === ORIENTATION_STATUS.FINISHED) {
    return { video: serializeVideo(video), progress: existing };
  }

  const nextWatched = Math.max(
    existing.watchedSeconds || 0,
    Math.floor(Number(watchedSeconds) || 0),
  );

  const progress = await prisma.orientationProgress.update({
    where: { id: existing.id },
    data: { watchedSeconds: nextWatched },
    select: progressSelect,
  });

  return { video: serializeVideo(video), progress };
};

export const finishOrientationProgress = async (userId, orientationVideoId) => {
  const existing = await prisma.orientationProgress.findUnique({
    where: {
      userId_orientationVideoId: {
        userId,
        orientationVideoId,
      },
    },
    select: progressSelect,
  });

  if (!existing) {
    throw new OrientationError('Please start the orientation video first.', 400);
  }

  const videoRecord = await prisma.orientationVideo.findUnique({
    where: { id: orientationVideoId },
    select: videoSelect,
  });
  const video = serializeVideo(videoRecord);

  if (!video) {
    throw new OrientationError(
      'Orientation is not available for this grade level yet.',
      404,
    );
  }

  if (existing.status === ORIENTATION_STATUS.FINISHED) {
    return { video, progress: existing };
  }

  if ((existing.watchedSeconds || 0) < video.requiredWatchSeconds) {
    throw new OrientationError(
      'Please watch the orientation video until the required time before finishing.',
      400,
    );
  }

  const progress = await prisma.orientationProgress.update({
    where: { id: existing.id },
    data: {
      status: ORIENTATION_STATUS.FINISHED,
      finishedAt: new Date(),
      watchedSeconds: Math.max(existing.watchedSeconds, video.requiredWatchSeconds),
    },
    select: progressSelect,
  });

  return { video, progress };
};

export const assertOrientationFinished = async (userId, gradeLevel, schoolYear) => {
  if (!userId || !gradeLevel || !schoolYear) {
    throw new OrientationError(
      'Please finish the orientation video before enrolling.',
      403,
    );
  }

  const { videos, allFinished } = await getOrientationForParent(
    userId,
    gradeLevel,
    schoolYear,
  );

  if (!videos.length) {
    throw new OrientationError(
      'Orientation is not available for this grade level yet. Please contact Living Pupil Homeschool.',
      403,
    );
  }

  if (!allFinished) {
    throw new OrientationError(
      'Please finish all orientation videos before enrolling.',
      403,
    );
  }

  return { videos };
};

export const getAllOrientationVideos = async () => {
  const videos = await prisma.orientationVideo.findMany({
    where: { deletedAt: null },
    orderBy: [{ schoolYear: 'desc' }, { createdAt: 'desc' }],
    select: videoSelect,
  });

  return videos.map(serializeVideo);
};

export const getReusableOrientationVideos = async () => {
  const videos = await prisma.orientationVideo.findMany({
    where: {
      videoUrl: {
        not: '',
      },
    },
    orderBy: [{ schoolYear: 'desc' }, { createdAt: 'desc' }],
    select: videoSelect,
  });

  const seen = new Set();
  return videos.map(serializeVideo).filter((video) => {
    const key = video.videoPath || video.videoUrl;
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const getAllOrientationProgress = async () =>
  prisma.orientationProgress.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      ...progressSelect,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          guardianInformation: {
            select: {
              primaryGuardianName: true,
            },
          },
        },
      },
      orientationVideo: {
        select: {
          title: true,
          requiredWatchSeconds: true,
        },
      },
    },
  });

export const createOrientationVideo = async ({
  title,
  gradeLevels,
  schoolYear,
  videoUrl,
  videoPath,
  requiredWatchSeconds,
  isActive = true,
}) => {
  const video = await prisma.orientationVideo.create({
    data: {
      title,
      schoolYear,
      videoUrl,
      videoPath: videoPath || null,
      requiredWatchSeconds,
      isActive,
      gradeLevels: {
        create: gradeLevels.map((gradeLevel) => ({ gradeLevel })),
      },
    },
    select: videoSelect,
  });

  return serializeVideo(video);
};

export const updateOrientationVideo = async (
  id,
  {
    title,
    gradeLevels,
    schoolYear,
    videoUrl,
    videoPath,
    requiredWatchSeconds,
    isActive,
  },
) => {
  const video = await prisma.$transaction(async (tx) => {
    if (gradeLevels) {
      await tx.orientationVideoGrade.deleteMany({
        where: { orientationVideoId: id },
      });
    }

    return tx.orientationVideo.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(schoolYear !== undefined ? { schoolYear } : {}),
        ...(videoUrl !== undefined ? { videoUrl } : {}),
        ...(videoPath !== undefined ? { videoPath } : {}),
        ...(requiredWatchSeconds !== undefined ? { requiredWatchSeconds } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(gradeLevels
          ? {
              gradeLevels: {
                create: gradeLevels.map((gradeLevel) => ({ gradeLevel })),
              },
            }
          : {}),
      },
      select: videoSelect,
    });
  });

  return serializeVideo(video);
};

export const deleteOrientationVideo = async (id) => {
  const video = await prisma.orientationVideo.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
    select: videoSelect,
  });

  return serializeVideo(video);
};
