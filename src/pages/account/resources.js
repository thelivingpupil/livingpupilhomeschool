import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import { useWorkspaces } from '@/hooks/data';
import sanityClient from '@/lib/server/sanity';
import { useMemo } from 'react';
import {
  GRADE_LEVEL,
  PROGRAM,
  SCHOOL_YEAR,
} from '@/utils/constants';
import { useState } from 'react';

const formGradeLevels = {
  KINDER: ['K1', 'K2'],
  FORM_1: ['GRADE_1', 'GRADE_2', 'GRADE_3'],
  FORM_2: ['GRADE_4', 'GRADE_5', 'GRADE_6'],
  FORM_3: ['GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10'],
};

const SCIENCE_EXPERIMENT_SCHOOL_YEARS = [
  SCHOOL_YEAR.SY_2025_2026,
  SCHOOL_YEAR.SY_2026_2027,
];

const gradeSortValue = (grade) => {
  if (!grade) return 0;
  if (grade === 'K1') return 0;
  if (grade === 'K2') return 1;
  const num = Number(grade.split('_')[1]);
  return Number.isNaN(num) ? 0 : num;
};

const narrationGuideMatchesFilter = (guide, filter) => {
  if (guide.schoolYear !== filter.schoolYear) return false;
  if (guide.program && guide.program !== filter.program) return false;

  const { grade } = filter;
  if (guide.targetingMode === 'SINGLE_GRADE') return guide.grade === grade;
  if (guide.targetingMode === 'MULTIPLE_GRADES') {
    return guide.grades?.includes(grade);
  }
  if (guide.targetingMode === 'FORM') {
    return formGradeLevels[guide.form]?.includes(grade);
  }
  return false;
};

const getMatchingGradesForGuide = (guide, filters) => {
  const grades = filters
    .filter((f) => narrationGuideMatchesFilter(guide, f))
    .map((f) => f.grade);

  return [...new Set(grades)].sort(
    (a, b) => gradeSortValue(a) - gradeSortValue(b),
  );
};

const getNarrationGuideLabel = (guide, matchingGrades) => {
  const levelLabel = matchingGrades
    .map((grade) => GRADE_LEVEL[grade] || grade?.replace('_', ' '))
    .join(', ');

  const programLabel = guide.program
    ? PROGRAM[guide.program] || guide.program?.replace('_', ' ')
    : null;

  return programLabel ? `${levelLabel} - ${programLabel.trim()}` : levelLabel;
};

const Resources = ({
  lessonPlans,
  blueprints,
  booklist,
  narrationGuides,
  recitation,
  commonSubjects,
  scienceExperiment,
}) => {
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

  // const availableSchoolYear = useMemo(() => {
  //   if (!data) {
  //     return [];
  //   }

  //   return data?.workspaces
  //     ?.filter((workspace) => workspace?.studentRecord)
  //     ?.map((workspace) => workspace?.studentRecord?.schoolYear);
  // }, [data]);

  const availablePrograms = useMemo(() => {
    if (!data) {
      return [];
    }

    return data?.workspaces
      ?.filter((workspace) => workspace?.studentRecord)
      ?.map((workspace) => workspace?.studentRecord?.program);
  }, [data]);
  const availableFilters = useMemo(() => {
    if (!data) return [];

    return data.workspaces
      ?.filter((workspace) => workspace?.studentRecord)
      ?.map((workspace) => ({
        program: workspace.studentRecord.program,
        schoolYear: workspace.studentRecord.schoolYear,
        grade: workspace.studentRecord.incomingGradeLevel,
      }));
  }, [data]);

  const isValidCommonSubject = useMemo(() => {
    if (!data) {
      return false;
    }

    return (
      availablePrograms?.includes('HOMESCHOOL_PROGRAM') ||
      (availablePrograms?.includes('HOMESCHOOL_COTTAGE') &&
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
          false,
        ))
    );
  });

  const hasPreschool = useMemo(
    () => availableGrades?.includes('PRESCHOOL'),
    [availableGrades],
  );

  const availablePlans = useMemo(() => {
    return lessonPlans
      ?.sort(
        (a, b) =>
          Number(a?.grade?.split('_')[1] || 0) -
          Number(b?.grade?.split('_')[1] || 0),
      )
      ?.filter((item) => {
        return availableFilters.some(
          (f) =>
            f.grade === item.grade &&
            f.program === item.program &&
            f.schoolYear === item.schoolYear,
        );
      });
  }, [availableFilters, lessonPlans]);

  const availableBlueprints = useMemo(() => {
    return blueprints
      ?.sort(
        (a, b) =>
          Number(a?.grade?.split('_')[1] || 0) -
          Number(b?.grade?.split('_')[1] || 0),
      )
      ?.filter((item) => {
        return availableFilters.some(
          (f) =>
            f.grade === item.grade &&
            f.program === item.program &&
            f.schoolYear === item.schoolYear,
        );
      });
  }, [availableFilters, blueprints]);

  const availableBooklist = useMemo(() => {
    return booklist
      ?.sort(
        (a, b) =>
          Number(a?.grade?.split('_')[1] || 0) -
          Number(b?.grade?.split('_')[1] || 0),
      )
      ?.filter((item) => {
        return availableFilters.some(
          (f) =>
            f.grade === item.grade &&
            f.program === item.program &&
            f.schoolYear === item.schoolYear,
        );
      });
  }, [availableFilters, booklist]);

  const availableNarrationGuides = useMemo(() => {
    return narrationGuides
      ?.filter((item) =>
        availableFilters.some((f) => narrationGuideMatchesFilter(item, f)),
      )
      ?.map((guide) => ({
        ...guide,
        matchingGrades: getMatchingGradesForGuide(guide, availableFilters),
      }))
      ?.sort(
        (a, b) =>
          gradeSortValue(a.matchingGrades[0]) -
          gradeSortValue(b.matchingGrades[0]),
      );
  }, [availableFilters, narrationGuides]);

  const availableRecitation = useMemo(() => {
    return recitation
      ?.sort(
        (a, b) =>
          Number(a?.grade?.split('_')[1] || 0) -
          Number(b?.grade?.split('_')[1] || 0),
      )
      ?.filter((item) => {
        return availableFilters.some(
          (f) =>
            f.grade === item.grade &&
            f.program === item.program &&
            f.schoolYear === item.schoolYear,
        );
      });
  }, [availableFilters, recitation]);

  const availableCommonSubjects = useMemo(() => {
    return commonSubjects
      ?.sort(
        (a, b) =>
          Number(a?.grade?.split('_')[1] || 0) -
          Number(b?.grade?.split('_')[1] || 0),
      )
      ?.filter((item) => {
        return availableFilters.some(
          (f) =>
            f.grade === item.grade &&
            f.program === item.program &&
            f.schoolYear === item.schoolYear,
        );
      });
  }, [availableFilters, commonSubjects]);

  const availableScienceExperiment = useMemo(() => {
    return scienceExperiment
      ?.sort(
        (a, b) =>
          Number(a?.grade?.split('_')[1] || 0) -
          Number(b?.grade?.split('_')[1] || 0),
      )
      ?.filter((item) => SCIENCE_EXPERIMENT_SCHOOL_YEARS.includes(item.schoolYear))
      ?.filter((item) =>
        availableFilters.some(
          (f) =>
            SCIENCE_EXPERIMENT_SCHOOL_YEARS.includes(f.schoolYear) &&
            f.grade === item.grade &&
            f.program === item.program &&
            f.schoolYear === item.schoolYear,
        ),
      );
  }, [availableFilters, scienceExperiment]);
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
              <strong>Curriculum Guide</strong>
              <p className="text-base leading-relaxed mb-4">
                The LP Kindergarten lesson plan, booklist and blueprint
                available on the Parent Portal are intended only for continuing
                families who have already completed the Talino Curriculum. These
                materials are designed as a follow-up and may not provide the
                foundational learning necessary for new homeschoolers at the
                kindergarten level.
              </p>
              <p className="text-base leading-relaxed mb-4">
                We highly encourage you to begin with the Talino Curriculum to
                ensure your child’s learning journey starts with the right
                structure and support. Use the discount code:{' '}
                <strong>ILoveLP2026</strong> to avail 20% discount on all items,
                minimum purchase of P500, and expires Aug 31, 2026. Link:
                <a
                  href="https://charlottemasonphilippines.com/product/talino-charlotte-mason-curriculum-kinder/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  https://charlottemasonphilippines.com/product/talino-charlotte-mason-curriculum-kinder/
                </a>
                .
              </p>
            </div>
          )}
        </div>

        <Card>
          <Card.Body title="Available Lesson Plans">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-10">
              {availablePlans?.length > 0 &&
                availablePlans?.map((plan, idx) => {
                  const bgColor = 'bg-primary';
                  const gradeLabel =
                    GRADE_LEVEL[plan?.grade] ||
                    plan?.grade?.replace('_', ' ');
                  const planKey = `${plan?.schoolYear}-${plan?.grade}-${plan?.program}`;

                  return (
                    <div
                      key={planKey || idx}
                      className="flex flex-col gap-2 justify-center items-center"
                    >
                      {plan?.fileUrl && (
                        <a
                          className={`flex items-center justify-center py-2 px-3 rounded ${bgColor}-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:${bgColor}-500`}
                          href={
                            plan.fileName
                              ? `${plan.fileUrl}?dl=${encodeURIComponent(plan.fileName)}`
                              : plan.fileUrl
                          }
                        >
                          Time Table - {gradeLabel}
                        </a>
                      )}
                      {plan?.dailyLessonPlanFileUrl && (
                        <a
                          className={`flex items-center justify-center py-2 px-3 rounded ${bgColor}-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:${bgColor}-500`}
                          href={
                            plan.dailyLessonPlanFileName
                              ? `${plan.dailyLessonPlanFileUrl}?dl=${encodeURIComponent(plan.dailyLessonPlanFileName)}`
                              : plan.dailyLessonPlanFileUrl
                          }
                        >
                          Daily Lesson Plan - {gradeLabel}
                        </a>
                      )}
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
                  const bgColor = 'bg-primary';
                  return (
                    <div key={idx} className="flex justify-center">
                      <a
                        className={`flex items-center justify-center py-2 px-3 rounded ${bgColor}-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:${bgColor}-500`}
                        href={`${
                          blueprint?.fileUrl
                        }?dl=${blueprint?.grade?.toLowerCase()}-sy_blueprint.pdf`}
                      >
                        {blueprint?.grade?.replace('_', ' ')} -{' '}
                        {blueprint?.program?.replace('_', ' ')}
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
                  const bgColor = 'bg-primary';
                  return (
                    <div key={idx} className="flex justify-center">
                      <a
                        className={`flex items-center justify-center py-2 px-3 rounded ${bgColor}-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:${bgColor}-500`}
                        href={`${
                          booklist?.fileUrl
                        }?dl=${booklist?.grade?.toLowerCase()}-booklist.pdf`}
                      >
                        {booklist?.grade?.replace('_', ' ')} -{' '}
                        {booklist?.program?.replace('_', ' ')}
                      </a>
                    </div>
                  );
                })}
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body title="Narration Guide">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-10">
              {availableNarrationGuides?.length > 0 &&
                availableNarrationGuides?.map((guide, idx) => {
                  const bgColor = 'bg-primary';
                  const guideKey = `${guide?.schoolYear}-${guide?.targetingMode}-${guide?.grade || guide?.form || guide?.grades?.join(',')}-${guide?.program || 'both'}`;

                  return (
                    <div key={guideKey || idx} className="flex justify-center">
                      <a
                        className={`flex items-center justify-center py-2 px-3 rounded ${bgColor}-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:${bgColor}-500`}
                        href={
                          guide.fileName
                            ? `${guide.fileUrl}?dl=${encodeURIComponent(guide.fileName)}`
                            : `${guide.fileUrl}?dl=narration-guide.pdf`
                        }
                      >
                        {getNarrationGuideLabel(guide, guide.matchingGrades)}
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
                  const bgColor = 'bg-primary';
                  return (
                    <div key={idx} className="flex justify-center">
                      <a
                        className={`flex items-center justify-center py-2 px-3 rounded ${bgColor}-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:${bgColor}-500`}
                        href={`${
                          recitation?.fileUrl
                        }?dl=${recitation?.grade?.toLowerCase()}-recitation.pdf`}
                      >
                        {recitation?.grade?.replace('_', ' ')} -{' '}
                        {recitation?.program?.replace('_', ' ')}
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
                  const bgColor = 'bg-primary';
                  return (
                    <div key={idx} className="flex justify-center">
                      <a
                        className={`flex items-center justify-center py-2 px-3 rounded ${bgColor}-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:${bgColor}-500`}
                        href={`${
                          experiment?.fileUrl
                        }?dl=${experiment?.grade?.toLowerCase()}-experiment.pdf`}
                      >
                        {experiment?.grade?.replace('_', ' ')} -{' '}
                        {experiment?.program?.replace('_', ' ')}
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
                  const bgColor = 'bg-primary';
                  return (
                    <div key={idx} className="flex justify-center">
                      <a
                        className={`flex items-center justify-center py-2 px-3 rounded ${bgColor}-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:${bgColor}-500`}
                        href={`${
                          commonSubjects?.fileUrl
                        }?dl=${commonSubjects?.grade?.toLowerCase()}-common-subjects.pdf`}
                      >
                        {commonSubjects?.grade?.replace('_', ' ')} -{' '}
                        {commonSubjects?.program?.replace('_', ' ')}
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
                  className={`flex items-center justify-center py-2 px-3 rounded bg-primary-600  text-white w-full md:w-4/5 text-sm cursor-pointer hover:bg-secondary-500`}
                  href="/files/lp-lingo.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Charlotte Mason LINGO
                </a>
              </div>
              <div className="flex justify-center">
                <a
                  className={`flex items-center justify-center py-2 px-3 rounded bg-primary-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:bg-primary-500`}
                  href="/files/SY2026-2027%20Printables.pdf"
                  download="SY2026-2027 Printables.pdf"
                >
                  SY 2026-2027 Printables
                </a>
              </div>
              {hasPreschool && (
                <div className="flex justify-center">
                  <a
                    className={`flex items-center justify-center py-2 px-3 rounded bg-primary-600 text-white w-full md:w-4/5 text-sm cursor-pointer hover:bg-primary-500`}
                    href="/files/preschool-for-3s-notebook.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Preschool for 3&apos;s Notebook
                  </a>
                </div>
              )}
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
                      className={`flex items-center justify-center py-2 px-3 rounded bg-primary-600  text-white w-full md:w-4/5 text-sm cursor-pointer hover:bg-secondary-500`}
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
    'fileUrl': lessonPlanFile.asset->url,
    'fileName': lessonPlanFile.asset->originalFilename,
    'dailyLessonPlanFileUrl': dailyLessonPlanFile.asset->url,
    'dailyLessonPlanFileName': dailyLessonPlanFile.asset->originalFilename
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

  const narrationGuides = await sanityClient.fetch(`*[_type == 'narrationGuides']{
    'schoolYear': schoolYear,
    'program': programType,
    'targetingMode': targetingMode,
    'grade': gradeLevel,
    'grades': gradeLevels,
    'form': formLevel,
    'fileUrl': narrationGuideFile.asset->url,
    'fileName': narrationGuideFile.asset->originalFilename
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

  const scienceExperiment = await sanityClient.fetch(
    `*[_type == 'experiment' && schoolYear in $schoolYears]{
    'schoolYear': schoolYear,
    'grade': gradeLevel,
    'program': programType,
    'fileUrl': experimentFile.asset->url
  }`,
    { schoolYears: SCIENCE_EXPERIMENT_SCHOOL_YEARS },
  );

  return {
    props: {
      lessonPlans,
      blueprints,
      booklist,
      narrationGuides,
      recitation,
      commonSubjects,
      scienceExperiment,
    },
  };
};

export default Resources;
