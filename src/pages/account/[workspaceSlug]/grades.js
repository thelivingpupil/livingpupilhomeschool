import { useState } from 'react';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import { useWorkspace } from '@/providers/workspace';
import JotFormEmbed from 'react-jotform-embed';
import { GradeLevel } from '@prisma/client';
import { ChevronDownIcon } from '@heroicons/react/outline';

const forms = {
  [GradeLevel.K2]: '240981686870470',
  [GradeLevel.GRADE_1]: '240981690530458',
  [GradeLevel.GRADE_2]: '240981690530458',
  [GradeLevel.GRADE_3]: '240981690530458',
  [GradeLevel.GRADE_4]: '240980686578474',
  [GradeLevel.GRADE_5]: '240980686578474',
  [GradeLevel.GRADE_6]: '240980686578474',
  [GradeLevel.GRADE_7]: '240980946894474',
  [GradeLevel.GRADE_8]: '240980946894474',
  [GradeLevel.GRADE_9]: '240980946894474',
  [GradeLevel.GRADE_10]: '240980946894474',
};

const Grades = () => {
  const { workspace } = useWorkspace();
  const [formPage, setFormPage] = useState('');

  const handleSelectChange = (event) => {
    setFormPage(event.target.value);
  };

  return (
    workspace && (
      <AccountLayout>
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
              src={`https://form.jotform.com/242611457155454`}
              scrolling={true}
              style={{ height: '100%' }}
            />
          ) : (
            workspace &&
            workspace?.studentRecord?.incomingGradeLevel &&
            forms[workspace?.studentRecord?.incomingGradeLevel] && (
              <JotFormEmbed
                src={`https://form.jotform.com/${forms[workspace?.studentRecord?.incomingGradeLevel]}`}
                scrolling={true}
                style={{ height: '100%' }}
              />
            )
          )}
        </Content.Container>
      </AccountLayout>
    )
  );
};

export default Grades;
