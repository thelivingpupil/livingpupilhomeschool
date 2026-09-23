import { useMemo, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { DataGrid, GridToolbar, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarExport } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import { AdminLayout } from "@/layouts/index";
import Card from '@/components/Card';
import Meta from "@/components/Meta";
import { PARENT_TRAINING_CODES, PARENT_TRAINING_STATUS_BG_COLOR, SCHOOL_YEAR } from "@/utils/constants";
import { useParentTrainings } from "@/hooks/data";
import format from 'date-fns/format';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LESSON_GROUPS = [
    {
        key: 'lesson1',
        label: 'Parent Training 1',
        title: 'Atmosphere of Learning',
        codes: ['FPT20261'],
    },
    {
        key: 'lesson2',
        label: 'Parent Training 2',
        title: 'Foundations',
        codes: ['FPT20262', 'FPT20263A', 'FPT20263B', 'FPT20263C'],
    },
    {
        key: 'lesson3',
        label: 'Parent Training 3',
        title: 'Artist and Composer Study',
        codes: ['FPT20264'],
    },
    {
        key: 'lesson4',
        label: 'Parent Training 4',
        title: 'How to Grade (Kairos)',
        codes: ['PT26273A', 'PT26273C'],
    },
    {
        key: 'lesson5',
        label: 'Parent Training 5',
        title: 'How to Grade (MCS)',
        codes: ['PT26273B', 'SHDYB21'],
    },
    {
        key: 'lesson6',
        label: 'Parent Training 6',
        title: 'International Assessment',
        codes: ['PT26273D'],
    },
    {
        key: 'lesson7',
        label: 'Parent Training 7',
        title: 'CM Assessment (Kairos)',
        codes: ['Msha712!'],
    },
    {
        key: 'lesson8',
        label: 'Parent Training 8',
        title: 'CM Assessment (MCS)',
        codes: ['JDwhs18'],
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

const getOverallStats = (trainings, lessonGroups) => {
    const allCodes = lessonGroups.flatMap((lesson) => lesson.codes);
    const assignedRows = trainings.filter(
        (row) => row.guardianId && allCodes.includes(row.courseCode)
    );
    const finishedRows = assignedRows.filter((row) => row.status === 'FINISHED');
    const byGuardian = new Map();

    assignedRows.forEach((row) => {
        const lesson = lessonGroups.find((group) => group.codes.includes(row.courseCode));
        if (!lesson) return;

        if (!byGuardian.has(row.guardianId)) {
            byGuardian.set(row.guardianId, { assigned: new Set(), finished: new Set() });
        }

        const guardian = byGuardian.get(row.guardianId);
        guardian.assigned.add(lesson.key);
        if (row.status === 'FINISHED') {
            guardian.finished.add(lesson.key);
        }
    });

    let finished = 0;
    byGuardian.forEach(({ assigned, finished: finishedLessons }) => {
        if (
            assigned.size > 0 &&
            [...assigned].every((key) => finishedLessons.has(key))
        ) {
            finished += 1;
        }
    });

    const total = byGuardian.size;
    const assignmentTotal = assignedRows.length;
    const assignmentFinished = finishedRows.length;

    return {
        key: 'overall',
        label: 'Overall',
        title: 'Completed all assigned trainings',
        total,
        finished,
        remaining: total - finished,
        percent: total === 0 ? 0 : Math.round((finished / total) * 100),
        assignmentTotal,
        assignmentFinished,
        assignmentPercent:
            assignmentTotal === 0
                ? 0
                : Math.round((assignmentFinished / assignmentTotal) * 100),
    };
};

const overallPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'top' },
        tooltip: {
            callbacks: {
                label: (context) => {
                    const value = context.parsed || 0;
                    const total = context.dataset.data.reduce((sum, item) => sum + item, 0);
                    const percent = total === 0 ? 0 : Math.round((value / total) * 100);
                    return `${context.label}: ${value} parents (${percent}%)`;
                },
            },
        },
    },
};

const percentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (context) => `${context.parsed.y}% of assigned parents`,
            },
        },
    },
    scales: {
        x: {
            ticks: { maxRotation: 45, minRotation: 0 },
        },
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
    const [isDashboardOpen, setDashboardOpen] = useState(true);
    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarExport
                    csvOptions={{
                        fileName: `parent-trainings-${format(new Date(), 'yyyy.MM.dd.kk.mm.ss')}`,
                        utf8WithBom: true,
                    }}
                />
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

    const overallStats = useMemo(
        () => getOverallStats(trainings, LESSON_GROUPS),
        [trainings]
    );

    const chartStats = [overallStats, ...lessonStats];

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
            <button
                type="button"
                className="flex items-center justify-between w-full py-2 mb-2 text-left"
                onClick={() => setDashboardOpen((open) => !open)}
                aria-expanded={isDashboardOpen}
            >
                <Typography variant="body2" color="text.secondary">
                    SY {SCHOOL_YEAR.SY_2026_2027} completion snapshot for assigned parent trainings
                </Typography>
                <span className="text-sm text-gray-500">
                    {isDashboardOpen ? 'Hide' : 'Show'}
                </span>
            </button>
            {isDashboardOpen && (
            <div className="mb-5 space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {lessonStats.map((lesson) => (
                    <Card key={lesson.key}>
                        <Card.Body
                            title={
                                !isLoading &&
                                `${lesson.finished} of ${lesson.total} parents`
                            }
                            subtitle={!isLoading && `${lesson.percent}% completed ${lesson.label}`}
                        >
                            <p className="text-sm font-bold text-gray-500">{lesson.title}</p>
                        </Card.Body>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:items-stretch">
                <Card className="h-full">
                    <Card.Body title={!isLoading && 'Overall parent training completion'}>
                        {!isLoading && (
                            <div className="flex flex-col h-[420px]">
                                <div className="relative flex-1 min-h-0">
                                    <div className="absolute inset-0">
                                        <Pie
                                            data={{
                                                labels: ['Completed all assigned', 'Not completed'],
                                                datasets: [
                                                    {
                                                        data: [overallStats.finished, overallStats.remaining],
                                                        backgroundColor: ['#bbf7d0', '#fecaca'],
                                                        borderColor: ['#16a34a', '#dc2626'],
                                                        borderWidth: 1,
                                                    },
                                                ],
                                            }}
                                            options={overallPieOptions}
                                        />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <p className="text-2xl font-bold">
                                        {overallStats.finished} of {overallStats.total} parents
                                    </p>
                                    <p className="text-gray-400">
                                        {overallStats.percent}% completed all assigned trainings
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Overall · {overallStats.assignmentFinished} of {overallStats.assignmentTotal} Parent Trainings ({overallStats.assignmentPercent}%)
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Card>
                <Card className="h-full">
                    <Card.Body title={!isLoading && 'Completion rate by Parent Training'}>
                        {!isLoading && (
                            <div className="relative h-[420px]">
                                <Bar
                                    data={{
                                        labels: chartStats.map((lesson) => lesson.label),
                                        datasets: [
                                            {
                                                label: 'Completion rate',
                                                data: chartStats.map((lesson) => lesson.percent),
                                                backgroundColor: '#FFFAEE',
                                                borderColor: '#FAC84F',
                                                borderWidth: 1,
                                            },
                                        ],
                                    }}
                                    options={percentChartOptions}
                                />
                            </div>
                        )}
                    </Card.Body>
                </Card>
            </div>
            </div>
            )}
            <Box sx={{ height: 500, width: "100%", mt: 1 }}>
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
                            valueGetter: (value, row) => row?.guardian?.user?.email || row?.email || '',
                            renderCell: (params) => (
                                <span>{params.row?.guardian?.user.email} { }</span>
                            )
                        },
                        {
                            field: "courseCode",
                            headerName: "Parent Training",
                            headerAlign: 'center',
                            width: 180,
                            valueGetter: (value, row) => PARENT_TRAINING_CODES[row?.courseCode]?.name ?? 'Unknown Course',
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
                            valueGetter: (value, row) =>
                                row?.updatedAt && row?.status === 'FINISHED'
                                    ? format(new Date(row.updatedAt), 'MMMM dd, yyyy')
                                    : '-',
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
                            disableExport: true,
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
