import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import format from 'date-fns/format';

import { AdminLayout } from '@/layouts/index';
import Meta from '@/components/Meta';
import { useOrientationProgress } from '@/hooks/data';
import {
  GRADE_LEVEL,
  ORIENTATION_STATUS_BG_COLOR,
  formatSecondsToWatchTime,
} from '@/utils/constants';

const ParentOrientationAdmin = () => {
  const { data, isLoading } = useOrientationProgress();

  const rows =
    data?.progress?.map((row) => ({
      ...row,
      email: row?.user?.email || '',
      guardianName:
        row?.user?.guardianInformation?.primaryGuardianName ||
        row?.user?.name ||
        '',
      gradeLevelLabel: GRADE_LEVEL[row.gradeLevel] || row.gradeLevel,
      videoTitle: row?.orientationVideo?.title || '',
      watchedTime: formatSecondsToWatchTime(row.watchedSeconds),
      finishedAtLabel:
        row.finishedAt && row.status === 'FINISHED'
          ? format(new Date(row.finishedAt), 'MMMM dd, yyyy h:mm a')
          : '-',
    })) || [];

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
      </GridToolbarContainer>
    );
  }

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Parent Orientation" />
      <Typography variant="h4" gutterBottom>
        Parent Orientation
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Track which parents have started or finished orientation for each grade.
      </Typography>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          loading={isLoading}
          columns={[
            {
              field: 'guardianName',
              headerName: 'Guardian',
              flex: 1,
              minWidth: 160,
            },
            {
              field: 'email',
              headerName: 'Email',
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
              headerName: 'Grade Level',
              width: 150,
            },
            {
              field: 'videoTitle',
              headerName: 'Video',
              flex: 1,
              minWidth: 160,
            },
            {
              field: 'status',
              headerName: 'Status',
              width: 130,
              renderCell: (params) => (
                <span
                  className={`rounded-full py-0.5 text-xs px-2 ${
                    ORIENTATION_STATUS_BG_COLOR[params.value] ||
                    'bg-gray-200 text-gray-700'
                  }`}
                >
                  {params.value}
                </span>
              ),
            },
            {
              field: 'watchedTime',
              headerName: 'Watched',
              width: 110,
            },
            {
              field: 'finishedAtLabel',
              headerName: 'Finished',
              width: 190,
            },
          ]}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          slots={{ toolbar: CustomToolbar }}
          disableRowSelectionOnClick
        />
      </Box>
    </AdminLayout>
  );
};

export default ParentOrientationAdmin;
