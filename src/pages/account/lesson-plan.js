import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import { useWorkspaces } from '@/hooks/data';
import sanityClient from '@/lib/server/sanity';

const LessonPlan = ({ lessonPlans }) => {
  const workspaces = useWorkspaces();
  console.log('workspaces', workspaces);
  console.log('lessonPlans', lessonPlans);

  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - Guides and Lesson Plans" />
      <Content.Title
        title="Parent Guides and Lesson Plans"
        subtitle="View and download guides and lesson plans dedicated to the parents"
      />
      <Content.Divider />
      <Content.Container>
        <Card>
          <Card.Body title="Available Lesson Plans">
            <a
              className="w-full py-2 text-center rounded-lg text-primary-500 bg-secondary-500 hover:bg-secondary-600 disabled:opacity-25"
              href="https://www.facebook.com/livingpupilhomeschool"
              target="_blank"
            >
              Visit Facebook Page
            </a>
          </Card.Body>
        </Card>
      </Content.Container>
    </AccountLayout>
  );
};

export const getServerSideProps = async () => {
  const lessonPlans = await sanityClient.fetch(`*[_type == 'lessonPlans']{
    'grade': gradeLevel,
    'fileUrl': lessonPlanFile.asset->url
  }`);

  return {
    props: {
      lessonPlans,
    },
  };
};

export default LessonPlan;
