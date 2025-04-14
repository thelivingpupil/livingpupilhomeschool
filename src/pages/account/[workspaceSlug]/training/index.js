import Card from '@/components/Card';
import Content from '@/components/Content';
import Meta from '@/components/Meta';
import AccountLayout from '@/layouts/AccountLayout';
import sanityClient from '@/lib/server/sanity';
import { useWorkspace } from '@/providers/workspace';
import Link from 'next/link';
import { PARENT_TRAINING_CODES } from '@/utils/constants';

const Training = ({ courses }) => {
  const { workspace } = useWorkspace();
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

  return (
    workspace && (
      <AccountLayout>
        <Meta
          title={`Living Pupil Homeschool - ${workspace.name} | Training`}
        />
        <Content.Title
          title={`Courses and Training`}
          subtitle="You can access student courses and parent training materials in this section"
        />
        <Content.Divider />
        {workspace.studentRecord ? (
          <Content.Container>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {courses
                .filter(
                  (course) =>
                    course.gradeLevel?.includes(workspace.studentRecord?.incomingGradeLevel) &&
                    course.schoolYear?.includes(workspace.studentRecord?.schoolYear) &&
                    course.curriculum?.includes(workspace.studentRecord.program)
                )
                .sort((a, b) => collator.compare(a.code, b.code))
                .map((course, index) => (
                  <Card key={index}>
                    <h1 className="text-lg font-bold text-center">
                      {PARENT_TRAINING_CODES[course.code].sequence}
                    </h1>
                    <Card.Body
                      title={course.title}
                      subtitle={course.description}
                    />
                    <Card.Footer>
                      <Link href={`/account/${workspace.slug}/training/${course.code}`}>
                        <a className="text-primary-600">Open Course</a>
                      </Link>
                    </Card.Footer>
                  </Card>
                ))}
            </div>
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

export const getServerSideProps = async () => {
  const courses = await sanityClient.fetch(
    `*[_type == 'courses'] | order(name asc)`
  );
  return { props: { courses } };
};

export default Training;
