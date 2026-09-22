import { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { DataGrid, GridToolbar, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import { AdminLayout } from "@/layouts/index";
import Card from '@/components/Card';
import Meta from "@/components/Meta";
import { PARENT_TRAINING_CODES, PARENT_TRAINING_STATUS_BG_COLOR, SCHOOL_YEAR } from "@/utils/constants";
import { useParentTrainings } from "@/hooks/data";
import format from 'date-fns/format';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LESSON_GROUPS = [
    {
        key: 'lesson1',
        label: 'Lesson 1',
        title: 'Atmosphere of Learning',
        codes: ['FPT20261'],
    },
    {
        key: 'lesson2',
        label: 'Lesson 2',
        title: 'Foundations',
        codes: ['FPT20262', 'FPT20263A', 'FPT20263B', 'FPT20263C'],
    },
    {
        key: 'lesson3',
        label: 'Lesson 3',
        title: 'Artist and Composer Study',
        codes: ['FPT20264'],
    },
];

const getLessonStats = (trainings, codes) => {
    const assigned = new Set();
    const completed = new Set();

    trainings.forEach((row) => {
        if (!codes.includes(row.courseCode) || !row.guardianId) return;
        assigned.add(row.guardianId);
        if (row.status === 'FINISHED') completed.add(row.guardianId);
    });

    const total = assigned.size;
    const finished = completed.size;
    const percent = total === 0 ? 0 : Math.round((finished / total) * 100);

    return {
        total,
        finished,
        remaining: total - finished,
        percent,
    };
};

const countChartOptions = {
    responsive: true,
    plugins: {
        legend: { position: 'top' },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: { precision: 0 },
        },
    },
};

const percentChartOptions = {
    responsive: true,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (context) => `${context.parsed.y}% of assigned parents`,
            },
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            max: 100,
            ticks: {
                callback: (value) => `${value}%`,
            },
        },
    },
};

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

    const trainings = data?.parentTraining || [];

    const lessonStats = useMemo(
        () => LESSON_GROUPS.map((lesson) => ({
            ...lesson,
            ...getLessonStats(trainings, lesson.codes),
        })),
        [trainings]
    );

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
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                SY {SCHOOL_YEAR.SY_2026_2027} completion snapshot for Lessons 1-3
            </Typography>
            <div className="grid grid-cols-1 gap-5 mb-5 md:grid-cols-3">
                {lessonStats.map((lesson) => (
                    <Card key={lesson.key}>
                        <Card.Body
                            title={
                                !isLoading &&
                                `${lesson.finished} of ${lesson.total} parents`
                            }
                            subtitle={!isLoading && `${lesson.percent}% completed ${lesson.label}`}
                        >
                            <p className="text-sm text-gray-500">{lesson.title}</p>
                        </Card.Body>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 gap-5 mb-5 md:grid-cols-2">
                <Card>
                    <Card.Body title={!isLoading && 'Parents who completed each lesson'}>
                        {!isLoading && (
                            <Bar
                                data={{
                                    labels: lessonStats.map((lesson) => lesson.label),
                                    datasets: [
                                        {
                                            label: 'Completed',
                                            data: lessonStats.map((lesson) => lesson.finished),
                                            backgroundColor: '#9A9EE0',
                                            borderColor: '#2E3494',
                                            borderWidth: 1,
                                        },
                                        {
                                            label: 'Not completed',
                                            data: lessonStats.map((lesson) => lesson.remaining),
                                            backgroundColor: '#fecaca',
                                            borderColor: '#dc2626',
                                            borderWidth: 1,
                                        },
                                    ],
                                }}
                                options={countChartOptions}
                            />
                        )}
                    </Card.Body>
                </Card>
                <Card>
                    <Card.Body title={!isLoading && 'Completion rate by lesson'}>
                        {!isLoading && (
                            <Bar
                                data={{
                                    labels: lessonStats.map((lesson) => lesson.label),
                                    datasets: [
                                        {
                                            label: 'Completion rate',
                                            data: lessonStats.map((lesson) => lesson.percent),
                                            backgroundColor: '#FFFAEE',
                                            borderColor: '#FAC84F',
                                            borderWidth: 1,
                                        },
                                    ],
                                }}
                                options={percentChartOptions}
                            />
                        )}
                    </Card.Body>
                </Card>
            </div>
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
