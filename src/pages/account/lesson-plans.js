import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import { useWorkspaces } from '@/hooks/data';
import sanityClient from '@/lib/server/sanity';
import { useMemo } from 'react';

const LessonPlans = ({ lessonPlans }) => {
  const { data } = useWorkspaces();

  const availableGrades = useMemo(() => {
    if (!data) {
      return [];
    }

    return data?.workspaces
      ?.filter((workspace) => workspace?.studentRecord)
      ?.map((workspace) => workspace?.studentRecord?.incomingGradeLevel);
  }, [data]);

  const availablePlans = useMemo(
    () =>
      lessonPlans
        ?.sort(
          (a, b) => Number(a?.grade?.split('_')[1]) - b?.grade?.split('_')[1]
        )
        ?.filter((lessonPlan) => availableGrades.includes(lessonPlan?.grade)),
    [availableGrades, lessonPlans]
  );

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-10">
              {availablePlans?.length > 0 &&
                availablePlans?.map((plan, idx) => {
                  const bgColor = idx % 2 === 0 ? 'bg-primary' : 'bg-secondary';
                  return (
                    <div key={idx} className="flex justify-center">
                      <a
                        className={`flex items-center justify-center py-2 px-3 rounded ${bgColor}-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:${bgColor}-500`}
                        href={`${
                          plan?.fileUrl
                        }?dl=${plan?.grade?.toLowerCase()}-lesson_plan.pdf`}
                      >
                        {plan?.grade?.replace('_', ' ')}
                      </a>
                    </div>
                  );
                })}
            </div>
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

export default LessonPlans;
