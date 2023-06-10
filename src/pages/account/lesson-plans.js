import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import { useWorkspaces } from '@/hooks/data';
import sanityClient from '@/lib/server/sanity';
import { useMemo } from 'react';

const formGradeLevels = {
  KINDER: ['K1', 'K2'],
  FORM_1: ['GRADE_1', 'GRADE_2', 'GRADE_3'],
  FORM_2: ['GRADE_4', 'GRADE_5', 'GRADE_6'],
  FORM_3: ['GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10'],
};

const LessonPlans = ({ lessonPlans, blueprints }) => {
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
          (a, b) =>
            Number(a?.grade?.split('_')[1]) - Number(b?.grade?.split('_')[1])
        )
        ?.filter((lessonPlan) => availableGrades.includes(lessonPlan?.grade)),
    [availableGrades, lessonPlans]
  );

  const availableBlueprints = useMemo(
    () =>
      blueprints
        ?.sort(
          (a, b) =>
            Number(a?.form?.split('_')[1]) - Number(b?.form?.split('_')[1])
        )
        .filter(({ form }) => {
          const formGradeLevel = formGradeLevels[form];

          return formGradeLevel?.find((gradeLevel) =>
            availableGrades.includes(gradeLevel)
          );
        }),
    [availableGrades, blueprints]
  );

  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - Guides, Lesson Plans and School Year Blueprint" />
      <Content.Title
        title="Parent Guides, Lesson Plans and School Year Blueprint"
        subtitle="View and download guides, lesson plans and school year blueprints dedicated to the parents"
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
        <Card>
          <Card.Body title="SY Blueprints">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-10">
              {availableBlueprints?.length > 0 &&
                availableBlueprints?.map((blueprint, idx) => {
                  const bgColor = idx % 2 === 0 ? 'bg-primary' : 'bg-secondary';
                  return (
                    <div key={idx} className="flex justify-center">
                      <a
                        className={`flex items-center justify-center py-2 px-3 rounded ${bgColor}-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:${bgColor}-500`}
                        href={`${
                          blueprint?.fileUrl
                        }?dl=${blueprint?.form?.toLowerCase()}-sy_blueprint.pdf`}
                      >
                        {blueprint?.form?.replace('_', ' ')}
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

  const blueprints = await sanityClient.fetch(`*[_type == 'blueprints']{
    'form': formLevel,
    'fileUrl': blueprintFile.asset->url
  }`);

  return {
    props: {
      lessonPlans,
      blueprints,
    },
  };
};

export default LessonPlans;
