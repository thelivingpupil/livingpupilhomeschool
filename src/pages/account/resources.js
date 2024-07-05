import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import { useWorkspaces } from '@/hooks/data';
import sanityClient from '@/lib/server/sanity';
import { useMemo } from 'react';
import { PROGRAM } from '@/utils/constants';

const formGradeLevels = {
  KINDER: ['K1', 'K2'],
  FORM_1: ['GRADE_1', 'GRADE_2', 'GRADE_3'],
  FORM_2: ['GRADE_4', 'GRADE_5', 'GRADE_6'],
  FORM_3: ['GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10'],
};

const Resources = ({ lessonPlans, blueprints, booklist }) => {
  const { data } = useWorkspaces();

  const availableGrades = useMemo(() => {
    if (!data) {
      return [];
    }

    return data?.workspaces
      ?.filter((workspace) => workspace?.studentRecord)
      ?.map((workspace) => workspace?.studentRecord?.incomingGradeLevel);
  }, [data]);

  const availablePrograms = useMemo(() => {
    if (!data) {
      return [];
    }

    return data?.workspaces
      ?.filter((workspace) => workspace?.studentRecord)
      ?.map((workspace) => workspace?.studentRecord?.program);
  }, [data]);

  const isValidCommonSubject = useMemo(() => {
    if (!data) {
      return false;
    }

    return (
      availablePrograms?.includes('HOMESCHOOL_PROGRAM') &&
      availableGrades?.reduce(
        (isValid, grade) =>
          [
            'KINDERGARTEN_1',
            'KINDERGARTEN_2',
            'GRADE_1',
            'GRADE_2',
            'GRADE_3',
            'GRADE_4',
            'GRADE_5',
            'GRADE_6',
            'GRADE_7',
            'GRADE_8',
            'GRADE_9',
            'GRADE_10',
            'GRADE_11',
            'GRADE_12',
          ].includes(grade) || isValid,
        false
      )
    );
  });

  const availablePlans = useMemo(
    () =>
      lessonPlans
        ?.sort(
          (a, b) =>
            Number(a?.grade?.split('_')[1]) - Number(b?.grade?.split('_')[1])
        )
        ?.filter((lessonPlan) => {
          const isProgramLevelValid = lessonPlan?.program
            ? availablePrograms.includes(lessonPlan?.program)
            : true;

          return (
            availableGrades.includes(lessonPlan?.grade) && isProgramLevelValid
          );
        }),
    [availableGrades, lessonPlans]
  );

  const availableBlueprints = useMemo(
    () =>
      blueprints
        ?.sort(
          (a, b) =>
            Number(a?.grade?.split('_')[1]) - Number(b?.grade?.split('_')[1])
        )
        ?.filter((blueprints) => {
          const isProgramLevelValid = blueprints?.program
            ? availablePrograms.includes(blueprints?.program)
            : true;

          return (
            availableGrades.includes(blueprints?.grade) && isProgramLevelValid
          );
        }),
    [availableGrades, blueprints]
  );

  // const availableBlueprints = useMemo(
  //   () =>
  //     blueprints
  //       ?.sort(
  //         (a, b) => `${a?.program}-${a?.grade}` - `${b?.program}-${b?.form}`
  //       )
  //       .filter(({ grade, program }) => {
  //         const formGradeLevel = formGradeLevels[grade];

  //         const isProgramLevelValid = program
  //           ? availablePrograms.includes(program)
  //           : true;

  //         return (
  //           availableGrades.includes(blueprints?.grade) && isProgramLevelValid
  //         );
  //       }),
  //   [availableGrades, blueprints]
  // );

  const availableBooklist = useMemo(
    () =>
      booklist
        ?.sort(
          (a, b) =>
            Number(a?.grade?.split('_')[1]) - Number(b?.grade?.split('_')[1])
        )
        ?.filter((lessonPlan) => {
          const isProgramLevelValid = booklist?.program
            ? availablePrograms.includes(booklist?.program)
            : true;

          return (
            availableGrades.includes(booklist?.grade) && isProgramLevelValid
          );
        }),
    [availableGrades, lessonPlans]
  );

  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - Guides and Resources" />
      <Content.Title
        title="Parent Guides and Resources"
        subtitle="View and download guides and resources dedicated to the parents"
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
                        href={`${plan?.fileUrl
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
                        href={`${blueprint?.fileUrl
                          }?dl=${blueprint?.grade?.toLowerCase()}-sy_blueprint.pdf`}
                      >
                        {blueprint?.grade?.replace('_', ' ')}
                      </a>
                    </div>
                  );
                })}
            </div>
          </Card.Body>
        </Card>
        {/* <Card>
          <Card.Body title="SY Blueprints">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-10">
              {availableBlueprints?.length > 0 &&
                availableBlueprints?.map((blueprint, idx) => {
                  const bgColor = idx % 2 === 0 ? 'bg-primary' : 'bg-secondary';
                  return (
                    <div key={idx} className="flex justify-center">
                      <a
                        className={`flex items-center justify-center py-2 px-3 rounded ${bgColor}-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:${bgColor}-500`}
                        href={`${blueprint?.fileUrl
                          }?dl=${blueprint?.program?.toLowerCase()}-${blueprint?.grade?.toLowerCase()}-sy_blueprint.pdf`}
                      >
                        {`${PROGRAM[blueprint?.program]
                          } - ${blueprint?.grade?.replace('_', ' ')}`}
                      </a>
                    </div>
                  );
                })}
            </div>
          </Card.Body>
        </Card> */}
        <Card>
          <Card.Body title="Booklist">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-10">
              {availableBooklist?.length > 0 &&
                availableBooklist?.map((booklist, idx) => {
                  const bgColor = idx % 2 === 0 ? 'bg-primary' : 'bg-secondary';
                  return (
                    <div key={idx} className="flex justify-center">
                      <a
                        className={`flex items-center justify-center py-2 px-3 rounded ${bgColor}-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:${bgColor}-500`}
                        href={`${booklist?.fileUrl
                          }?dl=${booklist?.grade?.toLowerCase()}-lesson_plan.pdf`}
                      >
                        {booklist?.grade?.replace('_', ' ')}
                      </a>
                    </div>
                  );
                })}
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body title="Additional Resources">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-10">
              <div className="flex justify-center">
                <a
                  className={`flex items-center justify-center py-2 px-3 rounded bg-primary-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:bg-primary-500`}
                  href="/files/lp-faqs.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Frequently Asked Questions
                </a>
              </div>
              <div className="flex justify-center">
                <a
                  className={`flex items-center justify-center py-2 px-3 rounded bg-secondary-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:bg-secondary-500`}
                  href="/files/lp-lingo.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Charlotte Mason LINGO
                </a>
              </div>
              {isValidCommonSubject && (
                <>
                  <div className="flex justify-center">
                    <a
                      className={`flex items-center justify-center py-2 px-3 rounded bg-primary-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:bg-primary-500`}
                      href="/files/lp-common-subjects.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Common Subjects
                    </a>
                  </div>
                  <div className="flex justify-center">
                    <a
                      className={`flex items-center justify-center py-2 px-3 rounded bg-secondary-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:bg-secondary-500`}
                      href="/files/lp-notebooks.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Notebooks
                    </a>
                  </div>
                  <div className="flex justify-center">
                    <a
                      className={`flex items-center justify-center py-2 px-3 rounded bg-primary-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:bg-primary-500`}
                      href="/files/SY-Planner.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      SY Planner
                    </a>
                  </div>
                </>
              )}
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
    'program': programType,
    'fileUrl': lessonPlanFile.asset->url
  }`);

  const blueprints = await sanityClient.fetch(`*[_type == 'blueprints']{
    'grade': gradeLevel,
    'program': programType,
    'fileUrl': blueprintFile.asset->url
  }`);

  const booklist = await sanityClient.fetch(`*[_type == 'booklist']{
    'grade': gradeLevel,
    'program': programType,
    'fileUrl': blueprintFile.asset->url
  }`);

  return {
    props: {
      lessonPlans,
      blueprints,
      booklist,
    },
  };
};

export default Resources;
