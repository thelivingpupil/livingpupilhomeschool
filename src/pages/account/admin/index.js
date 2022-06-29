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

import Card from '@/components/Card';
import Content from '@/components/Content';
import Meta from '@/components/Meta';
import {
  useStudentsCount,
  useTransactionSales,
  useUsersCount,
} from '@/hooks/data';
import { AdminLayout } from '@/layouts/index';
import { GRADE_LEVEL, PROGRAM, STATUS } from '@/utils/constants';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = { responsive: true };

const Dashboard = () => {
  const { data: students, isLoading: isFetchingStudentsCount } =
    useStudentsCount();
  const { data: users, isLoading: isFetchingUsersCount } = useUsersCount();
  const { data: transactions, isLoading: isFetchingTransactionsSales } =
    useTransactionSales();

  console.log(transactions);

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Admin Dashboard" />
      <Content.Title
        title="Admin Dashboard"
        subtitle="View and manage every recorded data from the web application"
      />
      <Content.Divider />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card>
          <Card.Body
            title={
              !isFetchingStudentsCount &&
              `${students?.enrolled || 0} Enrolled Students`
            }
            subtitle={
              !isFetchingStudentsCount &&
              `${students?.total || 0} Total Students`
            }
          />
        </Card>
        <Card>
          <Card.Body
            title={
              !isFetchingUsersCount &&
              `${users?.verifiedUsers || 0} Verified Users`
            }
            subtitle={
              !isFetchingUsersCount && `${users?.total || 0} Total Users`
            }
          />
        </Card>
        <Card>
          <Card.Body
            title={
              !isFetchingTransactionsSales &&
              `${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PHP',
              }).format(transactions?.totalSales || 0)} Sales`
            }
            subtitle={
              !isFetchingTransactionsSales &&
              `${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PHP',
              }).format(transactions?.pendingSales || 0)} Pending Revenues`
            }
          />
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card>
          <Card.Body
            title={
              !isFetchingStudentsCount && 'Enrolled Students by Grade Level'
            }
          >
            {!isFetchingStudentsCount && (
              <Bar
                data={{
                  labels: Object.keys(GRADE_LEVEL).map(
                    (level) => GRADE_LEVEL[level]
                  ),
                  datasets: [
                    {
                      label: 'Total Enrolled Students by Grade Level',
                      data: Object.keys(GRADE_LEVEL).map(
                        (level) => students?.gradeLevelGroup[level]
                      ),
                      backgroundColor: '#9A9EE0',
                      borderColor: '#2E3494',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={chartOptions}
              />
            )}
          </Card.Body>
        </Card>
        <Card>
          <Card.Body
            title={!isFetchingStudentsCount && 'Enrolled Students by Program'}
          >
            {!isFetchingStudentsCount && (
              <Bar
                data={{
                  labels: Object.keys(PROGRAM).map(
                    (program) => PROGRAM[program]
                  ),
                  datasets: [
                    {
                      label: 'Total Enrolled Students by Program',
                      data: Object.keys(PROGRAM).map(
                        (program) => students?.programGroup[program]
                      ),
                      backgroundColor: '#FFFAEE',
                      borderColor: '#FAC84F',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={chartOptions}
              />
            )}
          </Card.Body>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card>
          <Card.Body
            title={!isFetchingTransactionsSales && 'Sales by Enrollment'}
          >
            {!isFetchingTransactionsSales && (
              <Pie
                data={{
                  labels: Object.keys(STATUS).map((status) => STATUS[status]),
                  datasets: [
                    {
                      data: Object.keys(STATUS).map(
                        (status) => transactions?.enrollmentSales[status]
                      ),
                      backgroundColor: [
                        '#bbf7d0',
                        '#fecaca',
                        '#bfdbfe',
                        '#e5e7eb',
                        '#fef08a',
                        '#f5d0fe',
                        '#fff',
                        '#9A9EE0',
                      ],
                      borderColor: [
                        '#16a34a',
                        '#dc2626',
                        '#2563eb',
                        '#000',
                        '#ca8a04',
                        '#c026d3',
                        '#333',
                        '#2E3494',
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
              />
            )}
          </Card.Body>
        </Card>
        <Card>
          <Card.Body title={!isFetchingTransactionsSales && 'Sales by Store'}>
            {!isFetchingTransactionsSales && (
              <Pie
                data={{
                  labels: Object.keys(STATUS).map((status) => STATUS[status]),
                  datasets: [
                    {
                      data: Object.keys(STATUS).map(
                        (status) => transactions?.storeSales[status]
                      ),
                      backgroundColor: [
                        '#bbf7d0',
                        '#fecaca',
                        '#bfdbfe',
                        '#e5e7eb',
                        '#fef08a',
                        '#f5d0fe',
                        '#fff',
                        '#9A9EE0',
                      ],
                      borderColor: [
                        '#16a34a',
                        '#dc2626',
                        '#2563eb',
                        '#000',
                        '#ca8a04',
                        '#c026d3',
                        '#333',
                        '#2E3494',
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
              />
            )}
          </Card.Body>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
