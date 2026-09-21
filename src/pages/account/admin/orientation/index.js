import { useState } from 'react';
import crypto from 'crypto';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { Box, Button, Typography } from '@mui/material';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import toast from 'react-hot-toast';

import { AdminLayout } from '@/layouts/index';
import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { useOrientationVideos } from '@/hooks/data';
import api from '@/lib/common/api';
import { storage } from '@/lib/client/firebase';
import {
  GRADE_LEVEL,
  GRADE_LEVEL_GROUPS,
  REGISTRAR_SCHOOL_YEARS,
  formatSecondsToWatchTime,
  parseWatchTimeToSeconds,
} from '@/utils/constants';

const emptyForm = {
  title: '',
  schoolYear: REGISTRAR_SCHOOL_YEARS[0] || '',
  gradeLevels: [],
  requiredWatchTime: '',
  isActive: true,
  videoUrl: '',
  videoPath: '',
  videoSource: 'upload',
  reusedVideoKey: '',
};

const formatGradeLevels = (gradeLevels = []) =>
  gradeLevels.map((level) => GRADE_LEVEL[level] || level).join(', ');

const getVideoDuration = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read video duration'));
    };
    video.src = url;
  });

const uploadOrientationVideo = (file, schoolYear) => {
  const extension = file.name?.split('.').pop() || 'mp4';
  const folderId = crypto
    .createHash('md5')
    .update(`${file.name}${Date.now()}${Math.random()}`)
    .digest('hex')
    .substring(0, 12);
  const safeSchoolYear = String(schoolYear).replace(/[^\w-]/g, '-');
  const fileName = `files/admin/orientation-${safeSchoolYear}-${folderId}-${Date.now()}.${extension}`;
  const storageRef = ref(storage, fileName);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type || 'video/mp4',
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      null,
      (error) => {
        reject(
          new Error(error?.message || error?.code || 'Failed to upload video'),
        );
      },
      async () => {
        try {
          const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ videoUrl, videoPath: fileName });
        } catch (error) {
          reject(new Error(error?.message || 'Failed to get video URL'));
        }
      },
    );
  });
};

const OrientationAdmin = () => {
  const { data, isLoading, mutate } = useOrientationVideos();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const videoRows =
    data?.videos?.map((video) => ({
      ...video,
      gradeLevelLabel: formatGradeLevels(video.gradeLevels || []),
      requiredWatchTime: formatSecondsToWatchTime(video.requiredWatchSeconds),
    })) || [];

  const reusableVideos = data?.reusableVideos || [];

  const getReusableVideoKey = (video) => video.videoPath || video.videoUrl;

  const applyReusedVideo = (key) => {
    const source = reusableVideos.find(
      (video) => getReusableVideoKey(video) === key,
    );

    setVideoFile(null);
    setForm((prev) => ({
      ...prev,
      videoSource: 'reuse',
      reusedVideoKey: key,
      videoUrl: source?.videoUrl || '',
      videoPath: source?.videoPath || '',
      requiredWatchTime:
        prev.requiredWatchTime ||
        (source
          ? formatSecondsToWatchTime(source.requiredWatchSeconds)
          : prev.requiredWatchTime),
    }));
  };

  const openCreateModal = () => {
    setEditingVideo(null);
    setVideoFile(null);
    setUploadProgress(0);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
    setVideoFile(null);
    setUploadProgress(0);
    setForm({
      title: video.title || '',
      schoolYear: video.schoolYear || '',
      gradeLevels: video.gradeLevels || (video.gradeLevel ? [video.gradeLevel] : []),
      requiredWatchTime: formatSecondsToWatchTime(video.requiredWatchSeconds),
      isActive: video.isActive !== false,
      videoUrl: video.videoUrl || '',
      videoPath: video.videoPath || '',
      videoSource: 'upload',
      reusedVideoKey: '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVideo(null);
    setVideoFile(null);
    setUploadProgress(0);
    setForm(emptyForm);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.schoolYear || !form.gradeLevels.length || !form.requiredWatchTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const requiredWatchSeconds = parseWatchTimeToSeconds(form.requiredWatchTime);
    if (requiredWatchSeconds === null || requiredWatchSeconds <= 0) {
      toast.error('Required watch time must be in mm:ss format, e.g. 14:05');
      return;
    }

    if (!editingVideo && !videoFile && !(form.videoSource === 'reuse' && form.videoUrl)) {
      toast.error('Please upload a video or reuse an existing one');
      return;
    }

    setIsSubmitting(true);

    try {
      let videoUrl = form.videoUrl;
      let videoPath = form.videoPath;

      if (videoFile) {
        const duration = await getVideoDuration(videoFile);
        if (requiredWatchSeconds > duration) {
          throw new Error(
            `Required watch time (${formatSecondsToWatchTime(
              requiredWatchSeconds,
            )}) is longer than the video (${formatSecondsToWatchTime(duration)})`,
          );
        }

        const uploaded = await uploadOrientationVideo(
          videoFile,
          form.schoolYear,
        );
        videoUrl = uploaded.videoUrl;
        videoPath = uploaded.videoPath;
        setUploadProgress(100);
      }

      const payload = {
        title: form.title.trim(),
        schoolYear: form.schoolYear,
        gradeLevels: form.gradeLevels,
        requiredWatchSeconds,
        isActive: form.isActive,
        videoUrl,
        videoPath,
      };

      const response = editingVideo
        ? await api('/api/admin/orientation-videos', {
            method: 'PUT',
            body: { id: editingVideo.id, ...payload },
          })
        : await api('/api/admin/orientation-videos', {
            method: 'POST',
            body: payload,
          });

      if (response.status >= 400) {
        throw new Error(
          response.errors?.error?.msg || 'Failed to save orientation video',
        );
      }

      toast.success(
        editingVideo
          ? 'Orientation video updated successfully'
          : 'Orientation video created successfully',
      );
      await mutate();
      closeModal();
    } catch (error) {
      toast.error(error.message || 'Failed to save orientation video');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingVideo) {
      return;
    }

    if (!window.confirm(`Delete "${editingVideo.title}"? Parents will not be able to enroll in this grade until a new video is added.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await api('/api/admin/orientation-videos', {
        method: 'DELETE',
        body: { id: editingVideo.id },
      });

      if (response.status >= 400) {
        throw new Error(
          response.errors?.error?.msg || 'Failed to delete orientation video',
        );
      }

      toast.success('Orientation video deleted successfully');
      await mutate();
      closeModal();
    } catch (error) {
      toast.error(error.message || 'Failed to delete orientation video');
    } finally {
      setIsDeleting(false);
    }
  };

  function VideoToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <Button size="small" onClick={openCreateModal}>
          Add Orientation Video
        </Button>
      </GridToolbarContainer>
    );
  }

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Orientation Videos" />
      <Typography variant="h4" gutterBottom>
        Orientation Videos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload orientation videos, assign them to one or more grades, and set how
        long parents must watch before they can enroll. A grade can have more than
        one video.
      </Typography>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={videoRows}
          loading={isLoading}
          columns={[
            {
              field: 'title',
              headerName: 'Title',
              flex: 1,
              minWidth: 180,
            },
            {
              field: 'schoolYear',
              headerName: 'School Year',
              width: 130,
            },
            {
              field: 'gradeLevelLabel',
              headerName: 'Grade Levels',
              flex: 1,
              minWidth: 220,
            },
            {
              field: 'requiredWatchTime',
              headerName: 'Required Watch',
              width: 140,
            },
            {
              field: 'isActive',
              headerName: 'Active',
              width: 100,
              renderCell: (params) => (params.value ? 'Yes' : 'No'),
            },
            {
              field: 'actions',
              headerName: 'Actions',
              width: 120,
              sortable: false,
              filterable: false,
              renderCell: (params) => (
                <button
                  type="button"
                  className="px-3 py-1 text-xs text-white rounded-md bg-primary-500 hover:bg-primary-400"
                  onClick={() => openEditModal(params.row)}
                >
                  Edit
                </button>
              ),
            },
          ]}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          slots={{ toolbar: VideoToolbar }}
          disableRowSelectionOnClick
        />
      </Box>

      <SideModal
        title={editingVideo ? 'Edit Orientation Video' : 'Add Orientation Video'}
        show={showModal}
        toggle={closeModal}
      >
        <div className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="font-medium">Title *</label>
            <input
              className="px-3 py-2 border rounded"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Grade 1 Homeschool Orientation"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-medium">School Year *</label>
            <select
              className="px-3 py-2 border rounded"
              value={form.schoolYear}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, schoolYear: e.target.value }))
              }
            >
              <option value="">Select school year...</option>
              {REGISTRAR_SCHOOL_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-medium">Grade Levels *</label>
            <div className="grid grid-cols-2 gap-2 p-2 border rounded max-h-48 overflow-y-auto">
              {GRADE_LEVEL_GROUPS.map((group) =>
                group.levels.map((level) => (
                  <label key={level} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.gradeLevels.includes(level)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setForm((prev) => ({
                          ...prev,
                          gradeLevels: checked
                            ? [...prev.gradeLevels, level]
                            : prev.gradeLevels.filter((item) => item !== level),
                        }));
                      }}
                    />
                    <span>{GRADE_LEVEL[level]}</span>
                  </label>
                )),
              )}
            </div>
            <p className="text-xs text-gray-500">
              Assign this video to one or more grades. A grade can also have more
              than one orientation video. Videos assigned to every grade always
              play first.
            </p>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="font-medium">Required Watch Time (mm:ss) *</label>
            <input
              className="px-3 py-2 border rounded"
              value={form.requiredWatchTime}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  requiredWatchTime: e.target.value,
                }))
              }
              placeholder="14:05"
            />
            <p className="text-xs text-gray-500">
              Parents can click Finish Orientation only after watching this far.
            </p>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-medium">Video *</label>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={form.videoSource === 'upload'}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      videoSource: 'upload',
                      reusedVideoKey: '',
                      videoUrl: editingVideo?.videoUrl || '',
                      videoPath: editingVideo?.videoPath || '',
                    }))
                  }
                />
                <span>Upload new file</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={form.videoSource === 'reuse'}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      videoSource: 'reuse',
                    }))
                  }
                  disabled={reusableVideos.length === 0}
                />
                <span>Reuse existing video</span>
              </label>
            </div>
            {reusableVideos.length === 0 ? (
              <p className="text-xs text-gray-500">
                No previous videos yet. Upload a file first, then you can reuse it
                for other grades or school years.
              </p>
            ) : null}
          </div>

          {form.videoSource === 'reuse' ? (
            <div className="flex flex-col space-y-1">
              <label className="font-medium">Existing Video *</label>
              <select
                className="px-3 py-2 border rounded"
                value={form.reusedVideoKey}
                onChange={(e) => applyReusedVideo(e.target.value)}
              >
                <option value="">Select a previous video...</option>
                {reusableVideos.map((video) => {
                  const key = getReusableVideoKey(video);
                  return (
                    <option key={video.id} value={key}>
                      {video.title} ({formatGradeLevels(video.gradeLevels)} · {video.schoolYear})
                    </option>
                  );
                })}
              </select>
              {form.videoUrl ? (
                <video
                  className="w-full mt-2 bg-black rounded"
                  src={form.videoUrl}
                  controls
                  preload="metadata"
                />
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col space-y-1">
              <label className="font-medium">
                Video File {editingVideo || form.videoUrl ? '' : '*'}
              </label>
              <input
                type="file"
                accept="video/mp4,video/webm"
                className="px-3 py-2 border rounded"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
              {editingVideo && form.videoUrl && !videoFile ? (
                <p className="text-xs text-gray-500">
                  A video is already uploaded. Choose a new file only if you want to
                  replace it.
                </p>
              ) : null}
              {uploadProgress > 0 && uploadProgress < 100 ? (
                <p className="text-xs text-gray-500">Uploading...</p>
              ) : null}
            </div>
          )}

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            <span>Active</span>
          </label>

          <div className="flex items-center justify-between pt-4">
            {editingVideo ? (
              <button
                type="button"
                className="px-4 py-2 text-white rounded bg-red-600 hover:bg-red-400 disabled:opacity-50"
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            ) : (
              <span />
            )}
            <div className="flex space-x-2">
              <button
                type="button"
                className="px-4 py-2 border rounded"
                onClick={closeModal}
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-white rounded bg-primary-500 disabled:opacity-50"
                onClick={handleSubmit}
                disabled={isSubmitting || isDeleting}
              >
                {isSubmitting ? 'Saving...' : editingVideo ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      </SideModal>
    </AdminLayout>
  );
};

export default OrientationAdmin;
