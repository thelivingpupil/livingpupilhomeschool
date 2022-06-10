import Content from '@/components/Content';
import Meta from '@/components/Meta';
import { AdminLayout } from '@/layouts/index';

const Dashboard = () => {
  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Admin Dashboard" />
      <Content.Title
        title="Admin Dashboard"
        subtitle="View and manage every recorded data from the web application"
      />
      <Content.Divider />
    </AdminLayout>
  );
};

export default Dashboard;
