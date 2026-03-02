import { useState } from 'react';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import { useWorkspace } from '@/providers/workspace';
import JotFormEmbed from 'react-jotform-embed';
import { GradeLevel } from '@prisma/client';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { getSession } from 'next-auth/react';

const QUARTERLY_FORM_ID = '252259173067460';
const quarterlyForms = {
  [GradeLevel.K2]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_1]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_2]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_3]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_4]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_5]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_6]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_7]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_8]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_9]: QUARTERLY_FORM_ID,
  [GradeLevel.GRADE_10]: QUARTERLY_FORM_ID,
};

// Year End Requirements - by grade level
// K2 | Grades 1-3 | Grades 4-6 | Grades 7-10
const yearEndForms = {
  [GradeLevel.K2]: '260549507424459',
  [GradeLevel.GRADE_1]: '260549092239462',
  [GradeLevel.GRADE_2]: '260549092239462',
  [GradeLevel.GRADE_3]: '260549092239462',
  [GradeLevel.GRADE_4]: '260548590769472',
  [GradeLevel.GRADE_5]: '260548590769472',
  [GradeLevel.GRADE_6]: '260548590769472',
  [GradeLevel.GRADE_7]: '260549250286460',
  [GradeLevel.GRADE_8]: '260549250286460',
  [GradeLevel.GRADE_9]: '260549250286460',
  [GradeLevel.GRADE_10]: '260549250286460',
};

const Grades = () => {
  const { workspace } = useWorkspace();
  const [formPage, setFormPage] = useState('quarterly');

  const handleSelectChange = (event) => {
    setFormPage(event.target.value);
  };

  return (
    <AccountLayout>
      {workspace ? (
        <>
          <Meta title="Living Pupil Homeschool - Student Grades" />
          <Content.Title
            title={`${workspace.name} - Grades`}
            subtitle="View your student's grades"
          />
          <Content.Divider />
          <Content.Container>
            <div className="relative inline-block w-full sm:w-1/2 md:w-1/3 border-none">
              <select
                className="w-full px-3 py-1.5 text-xs sm:text-sm capitalize rounded appearance-none border leading-tight"
                onChange={handleSelectChange}
                value={formPage}
              >
                <option value="quarterly">Quarterly Requirements</option>
                <option value="year-end">Year End Requirements</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDownIcon className="w-5 h-5" />
              </div>
            </div>

            {(formPage === 'quarterly' || formPage === 'year-end') &&
              (() => {
                const forms =
                  formPage === 'quarterly' ? quarterlyForms : yearEndForms;
                const formId =
                  forms[workspace?.studentRecord?.incomingGradeLevel];
                if (!formId)
                  return (
                    <p className="mt-4 text-gray-600">
                      No form available for this grade level.
                    </p>
                  );
                return (
                  <div className="mt-4 min-h-[600px] w-full">
                    <JotFormEmbed
                      key={`${formPage}-${workspace?.studentRecord?.incomingGradeLevel}`}
                      src={`https://form.jotform.com/${formId}`}
                      scrolling={true}
                      style={{ height: '100%', minHeight: 600 }}
                    />
                  </div>
                );
              })()}
          </Content.Container>
        </>
      ) : null}
    </AccountLayout>
  );
};

// Force server-side rendering to ensure router.query is available
export const getServerSideProps = async (context) => {
  const session = await getSession(context);

  // Redirect to login if not authenticated, preserving the original URL
  if (!session) {
    const callbackUrl = encodeURIComponent(
      context.resolvedUrl || context.req.url,
    );
    return {
      redirect: {
        destination: `/auth/login?callbackUrl=${callbackUrl}`,
        permanent: false,
      },
    };
  }

  // Return empty props - workspace will be loaded by AccountLayout
  return {
    props: {},
  };
};

export default Grades;
