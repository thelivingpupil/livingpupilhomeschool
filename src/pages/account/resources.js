import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import { useWorkspaces } from '@/hooks/data';
import sanityClient from '@/lib/server/sanity';
import { useMemo } from 'react';
import { PROGRAM } from '@/utils/constants';
import { useState } from 'react';

const formGradeLevels = {
  KINDER: ['K1', 'K2'],
  FORM_1: ['GRADE_1', 'GRADE_2', 'GRADE_3'],
  FORM_2: ['GRADE_4', 'GRADE_5', 'GRADE_6'],
  FORM_3: ['GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10'],
};

const Resources = ({ lessonPlans, blueprints, booklist, recitation, commonSubjects, scienceExperiment }) => {
  const { data } = useWorkspaces();
  const [isOpen, setIsOpen] = useState(true);

  const availableGrades = useMemo(() => {
    if (!data) {
      return [];
    }

    return data?.workspaces
      ?.filter((workspace) => workspace?.studentRecord)
      ?.map((workspace) => workspace?.studentRecord?.incomingGradeLevel);
  }, [data]);

  const availableSchoolYear = useMemo(() => {
    if (!data) {
      return [];
    }

    return data?.workspaces
      ?.filter((workspace) => workspace?.studentRecord)
      ?.map((workspace) => workspace?.studentRecord?.schoolYear);
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
      availablePrograms?.includes('HOMESCHOOL_PROGRAM') || availablePrograms?.includes('HOMESCHOOL_COTTAGE') &&
      availableGrades?.reduce(
        (isValid, grade) =>
          [
            'K1',
            'K2',
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
            ? availablePrograms.includes(lessonPlan?.program) && availableSchoolYear.includes(lessonPlan?.schoolYear)
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
            ? availablePrograms.includes(blueprints?.program) && availableSchoolYear.includes(blueprints?.schoolYear)
            : true;

          return (
            availableGrades.includes(blueprints?.grade) && isProgramLevelValid
          );
        }),
    [availableGrades, blueprints]
  );

  const availableBooklist = useMemo(
    () =>
      booklist
        ?.sort(
          (a, b) =>
            Number(a?.grade?.split('_')[1]) - Number(b?.grade?.split('_')[1])
        )
        ?.filter((booklist) => {
          const isProgramLevelValid = booklist?.program
            ? availablePrograms.includes(booklist?.program) && availableSchoolYear.includes(booklist?.schoolYear)
            : true;

          return (
            availableGrades.includes(booklist?.grade) && isProgramLevelValid
          );
        }),
    [availableGrades, booklist]
  );

  const availableRecitation = useMemo(
    () =>
      recitation
        ?.sort(
          (a, b) =>
            Number(a?.grade?.split('_')[1]) - Number(b?.grade?.split('_')[1])
        )
        ?.filter((recitation) => {
          const isProgramLevelValid = recitation?.program
            ? availablePrograms.includes(recitation?.program) && availableSchoolYear.includes(recitation?.schoolYear)
            : true;

          return (
            availableGrades.includes(recitation?.grade) && isProgramLevelValid
          );
        }),
    [availableGrades, recitation]
  );

  const availableCommonSubjects = useMemo(
    () =>
      commonSubjects
        ?.sort(
          (a, b) =>
            Number(a?.grade?.split('_')[1]) - Number(b?.grade?.split('_')[1])
        )
        ?.filter((commonSubjects) => {
          const isProgramLevelValid = commonSubjects?.program
            ? availablePrograms.includes(commonSubjects?.program) && availableSchoolYear.includes(commonSubjects?.schoolYear)
            : true;

          return (
            availableGrades.includes(commonSubjects?.grade) && isProgramLevelValid
          );
        }),
    [availableGrades, commonSubjects]
  );


  const availableScienceExperiment = useMemo(
    () =>
      scienceExperiment
        ?.sort(
          (a, b) =>
            Number(a?.grade?.split('_')[1]) - Number(b?.grade?.split('_')[1])
        )
        ?.filter((scienceExperiment) => {
          const isProgramLevelValid = scienceExperiment?.program
            ? availablePrograms.includes(scienceExperiment?.program) && availableSchoolYear.includes(scienceExperiment?.schoolYear)
            : true;

          return (
            availableGrades.includes(scienceExperiment?.grade) && isProgramLevelValid
          );
        }),
    [availableGrades, scienceExperiment]
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
        <div className="text-center px-6 md:px-20">
          <div
            className="flex justify-center items-center gap-4 mb-4 cursor-pointer select-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <h1 className="text-xl font-bold text-red-600">
              For all K1 and K2 students
            </h1>
            <span className="text-sm text-red-600">
              [{isOpen ? 'Hide' : 'Show'}]
            </span>
          </div>

          {isOpen && (
            <div>
              <p className="text-base leading-relaxed mb-4">
                The LP Kindergarten lesson plan, booklist and blueprint available on the Parent Portal are intended only for continuing families who have already completed the Talino Curriculum. These materials are designed as a follow-up and may not provide the foundational learning necessary for new homeschoolers at the kindergarten level.
              </p>
              <p className="text-base leading-relaxed mb-4">
                We highly encourage you to begin with the Talino Curriculum to ensure your child’s learning journey starts with the right structure and support. Use the discount code: <strong>LPHS2025KINDER20</strong> to get 20% off at{' '}
                <a
                  href="https://charlottemasonphilippines.com/product/talino-charlotte-mason-curriculum-kinder/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  https://charlottemasonphilippines.com/product/talino-charlotte-mason-curriculum-kinder/
                </a>.
              </p>
            </div>
          )}
        </div>

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
                        {plan?.grade?.replace('_', ' ')} - {plan?.program?.replace('_', ' ')}
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
                        {blueprint?.grade?.replace('_', ' ')} - {blueprint?.program?.replace('_', ' ')}
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
                          }?dl=${booklist?.grade?.toLowerCase()}-booklist.pdf`}
                      >
                        {booklist?.grade?.replace('_', ' ')} - {booklist?.program?.replace('_', ' ')}
                      </a>
                    </div>
                  );
                })}
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body title="Recitation">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-10">
              {availableRecitation?.length > 0 &&
                availableRecitation?.map((recitation, idx) => {
                  const bgColor = idx % 2 === 0 ? 'bg-primary' : 'bg-secondary';
                  return (
                    <div key={idx} className="flex justify-center">
                      <a
                        className={`flex items-center justify-center py-2 px-3 rounded ${bgColor}-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:${bgColor}-500`}
                        href={`${recitation?.fileUrl
                          }?dl=${recitation?.grade?.toLowerCase()}-recitation.pdf`}
                      >
                        {recitation?.grade?.replace('_', ' ')} - {recitation?.program?.replace('_', ' ')}
                      </a>
                    </div>
                  );
                })}
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body title="Science Experiment">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-10">
              {availableScienceExperiment?.length > 0 &&
                availableScienceExperiment?.map((experiment, idx) => {
                  const bgColor = idx % 2 === 0 ? 'bg-primary' : 'bg-secondary';
                  return (
                    <div key={idx} className="flex justify-center">
                      <a
                        className={`flex items-center justify-center py-2 px-3 rounded ${bgColor}-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:${bgColor}-500`}
                        href={`${experiment?.fileUrl
                          }?dl=${experiment?.grade?.toLowerCase()}-experiment.pdf`}
                      >
                        {experiment?.grade?.replace('_', ' ')} - {experiment?.program?.replace('_', ' ')}
                      </a>
                    </div>
                  );
                })}
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body title="Common Subjects">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-10">
              {availableCommonSubjects?.length > 0 &&
                availableCommonSubjects?.map((commonSubjects, idx) => {
                  const bgColor = idx % 2 === 0 ? 'bg-primary' : 'bg-secondary';
                  return (
                    <div key={idx} className="flex justify-center">
                      <a
                        className={`flex items-center justify-center py-2 px-3 rounded ${bgColor}-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:${bgColor}-500`}
                        href={`${commonSubjects?.fileUrl
                          }?dl=${commonSubjects?.grade?.toLowerCase()}-common-subjects.pdf`}
                      >
                        {commonSubjects?.grade?.replace('_', ' ')} - {commonSubjects?.program?.replace('_', ' ')}
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
                  {/* <div className="flex justify-center">
                    <a
                      className={`flex items-center justify-center py-2 px-3 rounded bg-primary-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:bg-primary-500`}
                      href="/files/lp-common-subjects.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Common Subjects
                    </a>
                  </div> */}
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
    'schoolYear': schoolYear,
    'grade': gradeLevel,
    'program': programType,
    'fileUrl': lessonPlanFile.asset->url
  }`);

  const blueprints = await sanityClient.fetch(`*[_type == 'blueprints']{
    'schoolYear': schoolYear,
    'grade': gradeLevel,
    'program': programType,
    'fileUrl': blueprintFile.asset->url
  }`);

  const booklist = await sanityClient.fetch(`*[_type == 'booklist']{
    'schoolYear': schoolYear,
    'grade': gradeLevel,
    'program': programType,
    'fileUrl': booklistFile.asset->url
  }`);

  const recitation = await sanityClient.fetch(`*[_type == 'recitation']{
    'schoolYear': schoolYear,
    'grade': gradeLevel,
    'program': programType,
    'fileUrl': recitaionFile.asset->url
  }`);

  const commonSubjects = await sanityClient.fetch(`*[_type == 'commonSubjects']{
    'schoolYear': schoolYear,
    'grade': gradeLevel,
    'program': programType,
    'fileUrl': commonSubjectsFile.asset->url
  }`);

  const scienceExperiment = await sanityClient.fetch(`*[_type == 'experiment']{
    'schoolYear': schoolYear,
    'grade': gradeLevel,
    'program': programType,
    'fileUrl': experimentFile.asset->url
  }`);

  return {
    props: {
      lessonPlans,
      blueprints,
      booklist,
      recitation,
      commonSubjects,
      scienceExperiment
    },
  };
};

export default Resources;
