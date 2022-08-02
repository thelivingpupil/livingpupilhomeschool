import Content from '@/components/Content';
import Meta from '@/components/Meta';
import AccountLayout from '@/layouts/AccountLayout';
import { useWorkspace } from '@/providers/workspace';

const Training = () => {
  const { workspace } = useWorkspace();

  return (
    workspace && (
      <AccountLayout>
        <Meta title={`Living Pupil Homeschool - ${workspace.name} | Profile`} />
        <Content.Title
          title={`Courses and Training`}
          subtitle="You can access student courses and parent training materials in this section"
        />
        <Content.Divider />
        {workspace.studentRecord ? (
          <Content.Container>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3"></div>
          </Content.Container>
        ) : (
          <div className="px-3 py-3 text-sm text-red-500 border-2 border-red-600 rounded bg-red-50">
            <p>
              You will need to enroll your student first prior to viewing the
              student courses and parent training videos.
            </p>
          </div>
        )}
      </AccountLayout>
    )
  );
};

export default Training;
