import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import { useWorkspaces } from '@/hooks/data';
import sanityClient from '@/lib/server/sanity';
import { useMemo } from 'react';

const LessonPlan = ({ lessonPlans }) => {
  const { data, isLoading } = useWorkspaces();
  console.log('workspaces', data);
  console.log(
    'lessonPlans',
    lessonPlans?.sort(
      (a, b) => Number(a?.grade?.split('_')[1]) - b?.grade?.split('_')[1]
    )
  );

  const availableGrades = useMemo(() => {
    if (isLoading) {
      return [];
    }

    return data?.workspaces
      ?.filter((workspace) => workspace?.studentRecord)
      ?.map((workspace) => workspace?.studentRecord?.incomingGradeLevel);
  }, [data, isLoading]);

  console.log('availableGrades', availableGrades);

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
          <Card.Body title="Available Lesson Plans"></Card.Body>
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
