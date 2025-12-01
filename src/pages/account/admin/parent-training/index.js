import { useUsers } from "@/hooks/data";
import { DataGrid, GridToolbar, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import { AdminLayout } from "@/layouts/index";
import Meta from "@/components/Meta";
import { PARENT_TRAINING_CODES, PARENT_TRAINING_STATUS_BG_COLOR } from "@/utils/constants";
import { useParentTrainings } from "@/hooks/data";
import format from 'date-fns/format';
import toast from 'react-hot-toast';

const ParentTraining = () => {
    const { data, isLoading } = useParentTrainings();
    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
            </GridToolbarContainer>
        );
    }
    const columns = [

    ];

    const rows = data?.parentTraining.map((row) => ({
        ...row,
        primaryGuardianName: row?.guardian?.primaryGuardianName || '',
        email: row?.guardian?.user?.email || '',
        courseName: PARENT_TRAINING_CODES[row?.courseCode]?.name || 'Unknown',
        workspaceSlug: row?.guardian?.user?.createdWorkspace?.[0]?.slug || null,
        dateFinished:
            row?.updatedAt && row?.status === 'FINISHED'
                ? format(new Date(row.updatedAt), 'MMMM dd, yyyy')
                : '-'
    })) || [];

    const handleCopyLink = async (workspaceSlug, courseCode) => {
        if (!workspaceSlug) {
            toast.error('Workspace not found for this guardian');
            return;
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://livingpupilhomeschool.com';
        const link = `${appUrl}/account/${workspaceSlug}/training/${courseCode}`;

        try {
            await navigator.clipboard.writeText(link);
            toast.success('Link copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };



    return (
        <AdminLayout>
            <Meta title="Living Pupil Homeschool - Parent Training" />
            <Typography variant="h4" gutterBottom>
                Parent Trainings
            </Typography>
            <Box sx={{ height: 500, width: "100%" }}>
                <DataGrid
                    rows={rows}
                    columns={[
                        {
                            field: "primaryGuardianName",
                            headerName: "Guardian Name",
                            headerAlign: 'center',
                            width: 200,
                            renderCell: (params) => <span>{params.value || '-'}</span>
                        },
                        {
                            field: "email",
                            headerName: "Email",
                            headerAlign: 'center',
                            width: 200,
                            renderCell: (params) => (
                                <span>{params.row?.guardian?.user.email} { }</span>
                            )
                        },
                        {
                            field: "courseCode",
                            headerName: "Parent Training",
                            headerAlign: 'center',
                            width: 180,
                            renderCell: (params) => {
                                const course = PARENT_TRAINING_CODES[params.row?.courseCode];
                                return (
                                    <span>{course?.name ?? 'Unknown Course'}</span>
                                );
                            }
                        },
                        {
                            field: "schoolYear", headerName: "School Year", headerAlign: 'center',
                            align: 'center', width: 150
                        },
                        {
                            field: "status",
                            headerName: "Status",
                            width: 150,
                            headerAlign: 'center',
                            align: 'center',
                            renderCell: (params) => (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '100%',
                                        height: '100%',
                                    }}

                                >
                                    <span className={`rounded-full py-0.5 text-xs px-2 ${PARENT_TRAINING_STATUS_BG_COLOR[params.row.status]
                                        }`}>
                                        {params.row.status || 'N/A'}
                                    </span>
                                </div>
                            ),
                        },
                        {
                            field: "updatedAt",
                            headerName: "Date Finished",
                            width: 150,
                            align: 'center',
                            headerAlign: 'center',
                            renderCell: (params) => (
                                <span>
                                    {params.row?.updatedAt && params.row?.status === 'FINISHED'
                                        ? format(new Date(params.row.updatedAt), 'MMMM dd, yyyy')
                                        : '-'}
                                </span>
                            )
                        },
                        {
                            field: "action",
                            headerName: "Action",
                            width: 150,
                            headerAlign: 'center',
                            align: 'center',
                            sortable: false,
                            filterable: false,
                            renderCell: (params) => (
                                <button
                                    className="px-3 py-1 text-xs text-white rounded-md bg-primary-500 hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => handleCopyLink(params.row.workspaceSlug, params.row.courseCode)}
                                    disabled={!params.row.workspaceSlug}
                                    title={params.row.workspaceSlug ? 'Copy training link' : 'No workspace available'}
                                >
                                    Copy Link
                                </button>
                            )
                        },
                    ]}
                    slots={{
                        toolbar: CustomToolbar,
                    }}
                    loading={isLoading}
                    disableSelectionOnClick
                    auto
                    components={{ Toolbar: GridToolbar }}
                    autosizeOnMount
                />
            </Box>
        </AdminLayout>
    );
};

export default ParentTraining;
