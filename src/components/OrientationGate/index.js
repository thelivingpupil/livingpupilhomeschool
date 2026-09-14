import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { GradeLevel } from '@prisma/client';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import Button from '@/components/Button';
import api from '@/lib/common/api';
import {
  GRADE_LEVEL,
  GRADE_LEVEL_GROUPS,
  ORIENTATION_STATUS,
  SCHOOL_YEAR,
  formatSecondsToWatchTime,
} from '@/utils/constants';

const SEEK_TOLERANCE = 1.25;

const OrientationGate = ({
  show,
  initialGradeLevel,
  initialSchoolYear,
  onComplete,
}) => {
  const videoRef = useRef(null);
  const watchedSecondsRef = useRef(0);
  const heartbeatRef = useRef(null);
  const completingRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;
  const router = useRouter();

  const [gradeLevel, setGradeLevel] = useState(
    initialGradeLevel || GradeLevel.PRESCHOOL,
  );
  const [schoolYear, setSchoolYear] = useState(
    initialSchoolYear || SCHOOL_YEAR.SY_2026_2027,
  );
  const [stage, setStage] = useState('select');
  const [isLoading, setIsLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [unavailableMessage, setUnavailableMessage] = useState('');
  const [videos, setVideos] = useState([]);
  const [progressByVideoId, setProgressByVideoId] = useState({});
  const [currentVideo, setCurrentVideo] = useState(null);
  const [watchedSeconds, setWatchedSeconds] = useState(0);

  useEffect(() => {
    if (initialGradeLevel) {
      setGradeLevel(initialGradeLevel);
    }
  }, [initialGradeLevel]);

  useEffect(() => {
    if (initialSchoolYear) {
      setSchoolYear(initialSchoolYear);
    }
  }, [initialSchoolYear]);

  useEffect(() => {
    watchedSecondsRef.current = watchedSeconds;
  }, [watchedSeconds]);

  useEffect(() => {
    if (!show) {
      return undefined;
    }

    completingRef.current = false;
    setStage('select');
    setUnavailableMessage('');
    setVideos([]);
    setProgressByVideoId({});
    setCurrentVideo(null);
    setWatchedSeconds(0);
    watchedSecondsRef.current = 0;

    const prefetchGrade = initialGradeLevel || GradeLevel.PRESCHOOL;
    const prefetchYear = initialSchoolYear || SCHOOL_YEAR.SY_2026_2027;

    let cancelled = false;

    const prefetch = async () => {
      const response = await api(
        `/api/orientation?gradeLevel=${encodeURIComponent(
          prefetchGrade,
        )}&schoolYear=${encodeURIComponent(prefetchYear)}`,
        { method: 'GET' },
      );

      if (cancelled || completingRef.current) {
        return;
      }

      if (response.data?.allFinished) {
        completingRef.current = true;
        onCompleteRef.current({
          gradeLevel: prefetchGrade,
          schoolYear: prefetchYear,
        });
      }
    };

    prefetch();

    return () => {
      cancelled = true;
    };
  }, [show, initialGradeLevel, initialSchoolYear]);

  useEffect(() => {
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, []);

  const requiredSeconds = currentVideo?.requiredWatchSeconds || 0;
  const canFinish = watchedSeconds >= requiredSeconds && requiredSeconds > 0;
  const currentIndex = videos.findIndex((video) => video.id === currentVideo?.id);
  const finishedCount = videos.filter(
    (video) => progressByVideoId[video.id]?.status === ORIENTATION_STATUS.FINISHED,
  ).length;

  const persistProgress = async (seconds, videoId = currentVideo?.id) => {
    if (!videoId) {
      return;
    }

    try {
      await api('/api/orientation/progress', {
        method: 'POST',
        body: {
          orientationVideoId: videoId,
          watchedSeconds: Math.floor(seconds),
        },
      });
    } catch (error) {
      console.error('Failed to save orientation progress:', error);
    }
  };

  const startHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    heartbeatRef.current = setInterval(() => {
      persistProgress(watchedSecondsRef.current);
    }, 10000);
  };

  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const mapProgress = (progressList = []) =>
    progressList.reduce((acc, item) => {
      acc[item.orientationVideoId] = item;
      return acc;
    }, {});

  const playVideo = async (video, grade, year) => {
    const started = await api('/api/orientation/start', {
      method: 'POST',
      body: {
        orientationVideoId: video.id,
        gradeLevel: grade,
        schoolYear: year,
      },
    });

    if (started.status >= 400 || !started.data?.video) {
      throw new Error(
        started.errors?.error?.msg || 'Unable to start this orientation video.',
      );
    }

    const resumeAt = started.data.progress?.watchedSeconds || 0;
    setCurrentVideo(started.data.video);
    setWatchedSeconds(resumeAt);
    watchedSecondsRef.current = resumeAt;
    setProgressByVideoId((prev) => ({
      ...prev,
      [started.data.video.id]: started.data.progress,
    }));
    setStage('watch');
  };

  const handleWatch = async () => {
    if (!gradeLevel || !schoolYear) {
      toast.error('Please select a grade level and school year');
      return;
    }

    setIsLoading(true);
    setUnavailableMessage('');

    try {
      const lookup = await api(
        `/api/orientation?gradeLevel=${encodeURIComponent(
          gradeLevel,
        )}&schoolYear=${encodeURIComponent(schoolYear)}`,
        { method: 'GET' },
      );

      if (lookup.status >= 400 || !lookup.data?.videos?.length) {
        setUnavailableMessage(
          lookup.errors?.error?.msg ||
            'Orientation is not available for this grade level yet. Please contact Living Pupil Homeschool.',
        );
        return;
      }

      const nextVideos = lookup.data.videos;
      const nextProgress = mapProgress(lookup.data.progress);
      setVideos(nextVideos);
      setProgressByVideoId(nextProgress);

      if (lookup.data.allFinished) {
        completingRef.current = true;
        onCompleteRef.current({ gradeLevel, schoolYear });
        return;
      }

      const nextUnfinished =
        nextVideos.find(
          (video) => nextProgress[video.id]?.status !== ORIENTATION_STATUS.FINISHED,
        ) || nextVideos[0];

      await playVideo(nextUnfinished, gradeLevel, schoolYear);
    } catch (error) {
      toast.error(error.message || 'Failed to load orientation video');
    } finally {
      setIsLoading(false);
    }
  };

  const clampSeek = () => {
    const player = videoRef.current;
    if (!player) {
      return;
    }

    if (player.currentTime > watchedSecondsRef.current + SEEK_TOLERANCE) {
      player.currentTime = watchedSecondsRef.current;
    }
  };

  const handleTimeUpdate = () => {
    const player = videoRef.current;
    if (!player) {
      return;
    }

    const currentTime = player.currentTime;
    if (currentTime > watchedSecondsRef.current + SEEK_TOLERANCE) {
      player.currentTime = watchedSecondsRef.current;
      return;
    }

    if (currentTime > watchedSecondsRef.current) {
      const previous = watchedSecondsRef.current;
      setWatchedSeconds(currentTime);
      if (
        requiredSeconds > 0 &&
        previous < requiredSeconds &&
        currentTime >= requiredSeconds
      ) {
        persistProgress(currentTime);
      }
    }
  };

  const handleLoadedMetadata = () => {
    const player = videoRef.current;
    if (!player) {
      return;
    }

    if (watchedSecondsRef.current > 0) {
      player.currentTime = watchedSecondsRef.current;
    }
  };

  const handlePlay = () => {
    startHeartbeat();
  };

  const handlePause = () => {
    stopHeartbeat();
    persistProgress(watchedSecondsRef.current);
  };

  const handleClose = () => {
    stopHeartbeat();
    if (stage === 'watch') {
      persistProgress(watchedSecondsRef.current);
    }

    if (!completingRef.current) {
      router.push('/account');
    }
  };

  const handleFinish = async () => {
    if (!canFinish || !currentVideo) {
      return;
    }

    setIsFinishing(true);
    stopHeartbeat();
    await persistProgress(watchedSecondsRef.current);

    try {
      const response = await api('/api/orientation/finish', {
        method: 'POST',
        body: { orientationVideoId: currentVideo.id },
      });

      if (response.status >= 400) {
        throw new Error(
          response.errors?.error?.msg || 'Unable to finish orientation',
        );
      }

      const nextProgress = {
        ...progressByVideoId,
        [currentVideo.id]: response.data.progress,
      };
      setProgressByVideoId(nextProgress);

      const nextUnfinished = videos.find(
        (video) =>
          video.id !== currentVideo.id &&
          nextProgress[video.id]?.status !== ORIENTATION_STATUS.FINISHED,
      );

      if (nextUnfinished) {
        toast.success('Video completed. Please watch the next orientation.');
        await playVideo(nextUnfinished, gradeLevel, schoolYear);
        return;
      }

      completingRef.current = true;
      toast.success('Orientation completed. You may continue enrollment.');
      onCompleteRef.current({ gradeLevel, schoolYear });
    } catch (error) {
      toast.error(error.message || 'Unable to finish orientation');
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <Transition appear as={Fragment} show={show}>
      <Dialog
        className="fixed inset-0 z-50 overflow-y-auto text-gray-800"
        onClose={handleClose}
      >
        <div className="flex items-center justify-center min-h-full p-5">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="relative z-10 w-full max-w-3xl p-6 space-y-5 overflow-hidden text-left align-middle transition-all bg-white shadow-xl md:p-8">
              <button
                type="button"
                className="absolute top-0 outline-none right-5"
                onClick={handleClose}
                aria-label="Close orientation"
              >
                <XIcon className="w-6 h-6" />
              </button>
              <Dialog.Title as="h2" className="text-2xl font-bold pr-8">
                Homeschool Orientation
              </Dialog.Title>
              <p className="text-sm text-gray-600">
                Please complete the orientation video
                {videos.length > 1 ? 's' : ''} for your child&apos;s incoming
                grade level before continuing with enrollment.
              </p>

              {stage === 'select' ? (
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <label className="font-medium">Incoming Grade Level *</label>
                    <select
                      className="px-3 py-2 border rounded"
                      value={gradeLevel}
                      onChange={(e) => {
                        setGradeLevel(e.target.value);
                        setUnavailableMessage('');
                      }}
                    >
                      {GRADE_LEVEL_GROUPS.map((group) => (
                        <optgroup key={group.name} label={group.name}>
                          {group.levels.map((level) => (
                            <option key={level} value={level}>
                              {GRADE_LEVEL[level]}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="font-medium">School Year *</label>
                    <select
                      className="px-3 py-2 border rounded"
                      value={schoolYear}
                      onChange={(e) => {
                        setSchoolYear(e.target.value);
                        setUnavailableMessage('');
                      }}
                    >
                      <option value={SCHOOL_YEAR.SY_2026_2027}>
                        {SCHOOL_YEAR.SY_2026_2027}
                      </option>
                    </select>
                  </div>

                  {unavailableMessage ? (
                    <div className="px-3 py-3 text-sm text-red-600 border-2 border-red-600 rounded bg-red-50">
                      {unavailableMessage}
                    </div>
                  ) : null}

                  <div className="flex justify-end pt-2">
                    <Button
                      className="text-white bg-primary-600 hover:bg-primary-500"
                      disabled={isLoading || !gradeLevel || !schoolYear}
                      onClick={handleWatch}
                    >
                      {isLoading ? 'Loading...' : 'Watch Orientation'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {currentVideo?.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {GRADE_LEVEL[gradeLevel]} · {schoolYear}
                        {videos.length > 1
                          ? ` · Video ${Math.max(currentIndex, 0) + 1} of ${videos.length}`
                          : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-primary-600 hover:underline"
                      onClick={() => {
                        stopHeartbeat();
                        persistProgress(watchedSecondsRef.current);
                        setStage('select');
                        setUnavailableMessage('');
                      }}
                    >
                      Change grade
                    </button>
                  </div>

                  {videos.length > 1 ? (
                    <ul className="text-sm text-gray-600 space-y-1">
                      {videos.map((video, index) => {
                        const isFinished =
                          progressByVideoId[video.id]?.status ===
                          ORIENTATION_STATUS.FINISHED;
                        const isCurrent = video.id === currentVideo?.id;
                        return (
                          <li key={video.id}>
                            {index + 1}. {video.title}
                            {isFinished ? ' (finished)' : isCurrent ? ' (watching)' : ''}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}

                  <div className="overflow-hidden bg-black rounded-lg aspect-video">
                    <video
                      ref={videoRef}
                      className="w-full h-full"
                      controls
                      controlsList="nodownload noplaybackrate"
                      disablePictureInPicture
                      onLoadedMetadata={handleLoadedMetadata}
                      onPlay={handlePlay}
                      onPause={handlePause}
                      onSeeking={clampSeek}
                      onSeeked={clampSeek}
                      onTimeUpdate={handleTimeUpdate}
                      src={currentVideo?.videoUrl}
                    >
                      Your browser does not support the video player.
                    </video>
                  </div>

                  <div className="text-sm text-gray-600">
                    Watched {formatSecondsToWatchTime(watchedSeconds)} /{' '}
                    {formatSecondsToWatchTime(requiredSeconds)}.
                    {videos.length > 1
                      ? ` Completed ${finishedCount} of ${videos.length}.`
                      : ''}{' '}
                    Finish Orientation unlocks after you reach the required watch
                    time.
                  </div>

                  <div className="flex justify-end">
                    <Button
                      className="text-white bg-primary-600 hover:bg-primary-500"
                      disabled={!canFinish || isFinishing}
                      onClick={handleFinish}
                    >
                      {isFinishing
                        ? 'Saving...'
                        : currentIndex > -1 && currentIndex < videos.length - 1
                          ? 'Finish and Continue'
                          : 'Finish Orientation'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default OrientationGate;
