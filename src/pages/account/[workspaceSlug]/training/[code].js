import { PortableText } from '@portabletext/react';

import Card from '@/components/Card';
import Content from '@/components/Content';
import Meta from '@/components/Meta';
import AccountLayout from '@/layouts/AccountLayout';
import sanityClient from '@/lib/server/sanity';
import { useWorkspace } from '@/providers/workspace';

const Course = ({ course }) => {
  const { workspace } = useWorkspace();

  return (
    workspace && (
      <AccountLayout>
        <Meta
          title={`Living Pupil Homeschool - ${workspace.name} | ${course.title}`}
        />
        <Content.Title title={course.title} subtitle={course.description} />
        <Content.Divider />
        {workspace.studentRecord ? (
          <Content.Container>
            <Card>
              <Card.Body title="Watch This Training Video">
                <div className="mb-5 aspect-w-16 aspect-h-9 rounded-xl overflow-clip">
                  <iframe
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                    src={course.video}
                  ></iframe>
                </div>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body title="Course Lessons">
                {course.lessons.map((lesson, index) => (
                  <div
                    key={index}
                    className="px-5 py-3 border rounded border-primary-500"
                  >
                    <div>
                      <h2 className="flex flex-col text-3xl font-bold text-primary-500">
                        {lesson.name}
                      </h2>
                    </div>
                    <div className="flex flex-col px-5 space-y-3 text-gray-600">
                      <PortableText value={lesson.lesson} />
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
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

export const getServerSideProps = async ({ params }) => {
  const { code } = params;
  const course = await sanityClient.fetch(
    `*[_type == 'courses' && code == $code][0]{...}`,
    { code }
  );
  return { props: { course } };
};

export default Course;
