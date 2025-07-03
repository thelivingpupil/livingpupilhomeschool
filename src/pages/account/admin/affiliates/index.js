import React, { useState } from 'react';
import { DataGrid, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector } from '@mui/x-data-grid';
import { ChevronDownIcon } from '@heroicons/react/outline';
import format from 'date-fns/format';
import { getSession } from 'next-auth/react';

import Meta from '@/components/Meta';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import Card from '@/components/Card';
import { useAffiliates } from '@/hooks/data';

const Affiliates = ({ selectedYear }) => {
    const [year, setYear] = useState(selectedYear || new Date().getFullYear());
    const { data, isLoading, isError } = useAffiliates(year);

    // Function to flatten the affiliate data for the table
    const flattenAffiliateData = (affiliates) => {
        if (!affiliates || !Array.isArray(affiliates)) return [];

        const flattened = [];

        affiliates.forEach(affiliate => {
            // Safety check for invitedUsers
            if (!affiliate.invitedUsers || !Array.isArray(affiliate.invitedUsers)) {
                return; // Skip this affiliate if no invitedUsers
            }

            // Filter only invited users who have enrolled students
            const successfulInvites = affiliate.invitedUsers.filter(invitedUser =>
                invitedUser.createdWorkspace && invitedUser.createdWorkspace.length > 0
            );

            if (successfulInvites.length > 0) {
                // Create a row for each successful invite
                successfulInvites.forEach(invitedUser => {
                    invitedUser.createdWorkspace.forEach(workspace => {
                        if (workspace.studentRecord) {
                            flattened.push({
                                id: `${affiliate.id}-${invitedUser.id}-${workspace.id}`,
                                affiliateId: affiliate.id,
                                affiliateName: affiliate.name || 'N/A',
                                affiliateEmail: affiliate.email || 'N/A',
                                affiliateUserCode: affiliate.userCode || 'N/A',
                                affiliateJoinDate: affiliate.createdAt || null,
                                invitedUserId: invitedUser.id,
                                invitedUserName: invitedUser.name || 'N/A',
                                invitedUserEmail: invitedUser.email || 'N/A',
                                invitedUserJoinDate: invitedUser.createdAt || (invitedUser.createdWorkspace && invitedUser.createdWorkspace.length > 0 ? invitedUser.createdWorkspace[0].createdAt : null),
                                studentId: workspace.studentRecord.id,
                                studentName: `${workspace.studentRecord.firstName} ${workspace.studentRecord.middleName} ${workspace.studentRecord.lastName}`.trim() || 'N/A',
                                studentGradeLevel: workspace.studentRecord.incomingGradeLevel || 'N/A',
                                studentSchool: workspace.studentRecord.formerSchoolName || 'N/A',
                                studentStatus: workspace.studentRecord.studentStatus || 'N/A',
                                enrolledStudentCount: invitedUser.createdWorkspace.length,
                                originalData: {
                                    affiliate,
                                    invitedUser,
                                    workspace
                                }
                            });
                        }
                    });
                });
            }
        });

        return flattened;
    };

    const handleYearChange = (newYear) => {
        setYear(newYear);
    };

    const flattenedData = flattenAffiliateData(data);

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
            </GridToolbarContainer>
        );
    }

    if (isError) {
        return (
            <AdminLayout>
                <Meta title="Living Pupil Homeschool - Affiliate Management" />
                <Content.Title
                    title="Affiliate Management"
                    subtitle="View and manage affiliate data per year - showing only successful enrollments"
                />
                <div className="text-red-600 p-4">
                    Error loading affiliate data. Please try again.
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <Meta title="Living Pupil Homeschool - Affiliate Management" />
            <Content.Title
                title="Affiliate Management"
                subtitle="View and manage affiliate data per year - showing only successful enrollments"
            />
            <Content.Divider />

            <div className="flex flex-col md:flex-row mb-5 md:space-x-5">
                <div className="relative inline-block w-full md:w-1/4 rounded border">
                    <select
                        className="w-full px-3 py-2 capitalize rounded appearance-none"
                        onChange={(e) => handleYearChange(parseInt(e.target.value))}
                        value={year}
                    >
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronDownIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <Card>
                <Card.Body title={`Affiliate Data for ${year} - Successful Enrollments Only`}>
                    <div style={{ width: '100%' }}>
                        <div style={{ height: 680, width: '100%' }}>
                            <DataGrid
                                loading={isLoading}
                                rows={flattenedData}
                                getRowId={(row) => row.id}
                                filterMode="client"
                                disableColumnFilter={false}
                                disableColumnMenu={false}
                                sx={{
                                    '& .MuiDataGrid-root': {
                                        border: 'none',
                                    },
                                    '& .MuiDataGrid-cell': {
                                        borderBottom: '1px solid #e5e7eb',
                                        padding: '12px 8px',
                                        fontSize: '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    },
                                    '& .MuiDataGrid-columnHeaders': {
                                        backgroundColor: '#f8fafc',
                                        borderBottom: '2px solid #e5e7eb',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                    },
                                    '& .MuiDataGrid-columnHeader': {
                                        padding: '12px 8px',
                                    },
                                    '& .MuiDataGrid-row': {
                                        '&:hover': {
                                            backgroundColor: '#f1f5f9',
                                        },
                                        '&:nth-of-type(even)': {
                                            backgroundColor: '#fafafa',
                                        },
                                    },
                                    '& .MuiDataGrid-virtualScroller': {
                                        backgroundColor: '#ffffff',
                                    },
                                    '& .MuiDataGrid-footerContainer': {
                                        borderTop: '2px solid #e5e7eb',
                                        backgroundColor: '#f8fafc',
                                    },
                                }}
                                columns={[
                                    {
                                        field: 'affiliateName',
                                        headerName: 'Affiliate Name',
                                        headerAlign: 'center',
                                        align: 'left',
                                        flex: 1,
                                        filterable: true,
                                        type: 'string',
                                        renderCell: (params) => (
                                            <div className="text-primary-600 font-semibold text-sm">
                                                {params.row.affiliateName}
                                            </div>
                                        ),
                                    },
                                    {
                                        field: 'affiliateEmail',
                                        headerName: 'Affiliate Email',
                                        headerAlign: 'center',
                                        align: 'left',
                                        flex: 1,
                                        filterable: true,
                                        type: 'string',
                                    },


                                    {
                                        field: 'invitedUserName',
                                        headerName: 'Invited Parent Name',
                                        headerAlign: 'center',
                                        align: 'left',
                                        flex: 1,
                                        filterable: true,
                                        type: 'string',
                                        renderCell: (params) => (
                                            <div className="text-green-700 font-semibold text-sm">
                                                {params.row.invitedUserName}
                                            </div>
                                        ),
                                    },
                                    {
                                        field: 'invitedUserEmail',
                                        headerName: 'Invited Parent Email',
                                        headerAlign: 'center',
                                        align: 'left',
                                        flex: 1,
                                        filterable: true,
                                        type: 'string',
                                    },
                                    {
                                        field: 'invitedUserJoinDate',
                                        headerName: 'Invitee Joined/Enrolled',
                                        headerAlign: 'center',
                                        align: 'center',
                                        flex: 1,
                                        renderCell: (params) => {
                                            const date = params.row.invitedUserJoinDate;
                                            if (!date || date === '1970-01-01T00:00:00.000Z' || date === '1970-01-01') {
                                                return <div className="text-gray-400 italic text-sm">N/A</div>;
                                            }
                                            try {
                                                return <div className="font-medium text-gray-700 text-sm">{format(new Date(date), 'MMM dd, yyyy')}</div>;
                                            } catch (error) {
                                                return <div className="text-gray-400 italic text-sm">Invalid Date</div>;
                                            }
                                        },
                                    },

                                    // Student Status column hidden initially
                                    // {
                                    //     field: 'studentStatus',
                                    //     headerName: 'Student Status',
                                    //     headerAlign: 'center',
                                    //     align: 'center',
                                    //     flex: 0.8,
                                    //     filterable: true,
                                    //     type: 'string',
                                    //     renderCell: (params) => (
                                    //         <div className="font-medium">
                                    //             <span className={`rounded-full py-1 px-2 text-xs ${params.row.studentStatus === 'ENROLLED'
                                    //                 ? 'bg-green-100 text-green-800'
                                    //                 : params.row.studentStatus === 'PENDING'
                                    //                     ? 'bg-yellow-100 text-yellow-800'
                                    //                     : 'bg-red-100 text-red-800'
                                    //                 }`}>
                                    //                 {params.row.studentStatus}
                                    //             </span>
                                    //         </div>
                                    //     ),
                                    // },
                                    {
                                        field: 'enrolledStudentCount',
                                        headerName: 'Enrolled Student Count',
                                        headerAlign: 'center',
                                        align: 'center',
                                        flex: 0.6,
                                        type: 'number',
                                        renderCell: (params) => (
                                            <div className="font-bold text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                {params.row.enrolledStudentCount}
                                            </div>
                                        ),
                                    },
                                ]}
                                slots={{
                                    toolbar: CustomToolbar,
                                }}
                                autosizeOnMount
                                getRowHeight={() => 60}
                            />
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mt-5">
                <Card>
                    <Card.Body
                        title={`${flattenedData.length} Invited Parents`}
                        subtitle={`Total parents invited by affiliates in ${year}`}
                    />
                </Card>
                <Card>
                    <Card.Body
                        title={`${new Set(flattenedData.map(item => item.affiliateId)).size} Active Affiliates`}
                        subtitle={`Unique affiliates with successful referrals in ${year}`}
                    />
                </Card>
                <Card>
                    <Card.Body
                        title={`${flattenedData.reduce((sum, item) => sum + item.enrolledStudentCount, 0)} Enrolled Students`}
                        subtitle={`Total students enrolled through affiliates in ${year}`}
                    />
                </Card>
            </div>
        </AdminLayout>
    );
};

export const getServerSideProps = async (context) => {
    const session = await getSession(context);
    const currentYear = new Date().getFullYear();
    const year = parseInt(context.query.year) || currentYear;

    if (!session || session.user?.userType !== 'ADMIN') {
        return {
            redirect: {
                destination: '/account',
                permanent: false,
            },
        };
    }

    return {
        props: {
            selectedYear: year,
        },
    };
};

export default Affiliates; 