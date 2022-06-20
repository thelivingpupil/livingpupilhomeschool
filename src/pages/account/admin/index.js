import Card from '@/components/Card';
import Content from '@/components/Content';
import Meta from '@/components/Meta';
import { useStudentsCount } from '@/hooks/data';
import { AdminLayout } from '@/layouts/index';

const Dashboard = () => {
  const { data: students, isLoading: isFetchingStudentsCount } =
    useStudentsCount();

  console.log(students);

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
              !isFetchingStudentsCount && `${students?.enrolled || 0} Students`
            }
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
