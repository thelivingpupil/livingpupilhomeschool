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

const forms = {
  [GradeLevel.K2]: '252259173067460',
  [GradeLevel.GRADE_1]: '252259173067460',
  [GradeLevel.GRADE_2]: '252259173067460',
  [GradeLevel.GRADE_3]: '252259173067460',
  [GradeLevel.GRADE_4]: '252259173067460',
  [GradeLevel.GRADE_5]: '252259173067460',
  [GradeLevel.GRADE_6]: '252259173067460',
  [GradeLevel.GRADE_7]: '252259173067460',
  [GradeLevel.GRADE_8]: '252259173067460',
  [GradeLevel.GRADE_9]: '252259173067460',
  [GradeLevel.GRADE_10]: '252259173067460',
};

const Grades = () => {
  const { workspace } = useWorkspace();
  const [formPage, setFormPage] = useState('');

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
            <div
              className={`relative inline-block w-1/3 border-none`}
            >
              <select
                className="w-full px-3 py-2 capitalize rounded appearance-none border"
                onChange={handleSelectChange}
                value={formPage}
              >
                <option value="">Select Form</option>
                <option value="quarterly">Quarterly Requirements</option>
                <option value="year-end">Year End Requirements</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDownIcon className="w-5 h-5" />
              </div>
            </div>

            {formPage === 'quarterly' ? (
              <JotFormEmbed
                src={`https://form.jotform.com/${forms[workspace?.studentRecord?.incomingGradeLevel]}`}
                scrolling={true}
                style={{ height: '100%' }}
              />
            ) : (
              workspace &&
              workspace?.studentRecord?.incomingGradeLevel &&
              forms[workspace?.studentRecord?.incomingGradeLevel] && (
                // <JotFormEmbed
                //   src={`https://form.jotform.com/${forms[workspace?.studentRecord?.incomingGradeLevel]}`}
                //   scrolling={true}
                //   style={{ height: '100%' }}
                // />
                <></>
              )
            )}
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
    const callbackUrl = encodeURIComponent(context.resolvedUrl || context.req.url);
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
