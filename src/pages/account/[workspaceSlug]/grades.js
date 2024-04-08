import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import Card from '@/components/Card';
import { useWorkspace } from '@/providers/workspace';
import JotFormEmbed from 'react-jotform-embed';
import { GradeLevel } from '@prisma/client';

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

  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - Student Grades" />
      <Content.Title
        title="Student Grades"
        subtitle="View your student's grades"
      />
      <Content.Divider />

      {workspace &&
        workspace?.studentRecord?.incomingGradeLevel &&
        forms[workspace?.studentRecord?.incomingGradeLevel] && (
          <JotFormEmbed
            src={`https://form.jotform.com/${
              forms[workspace?.studentRecord?.incomingGradeLevel]
            }`}
            scrolling={true}
          />
        )}
    </AccountLayout>
  );
};

export default Grades;
