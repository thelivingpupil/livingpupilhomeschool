import { PortableText } from '@portabletext/react';
import { useState } from 'react';
import Card from '@/components/Card';
import Content from '@/components/Content';
import Meta from '@/components/Meta';
import AccountLayout from '@/layouts/AccountLayout';
import sanityClient from '@/lib/server/sanity';
import { useWorkspace } from '@/providers/workspace';
import toast from 'react-hot-toast';
import api from '@/lib/common/api';
import JotFormEmbed from 'react-jotform-embed';
import { PARENT_TRAINING_CODES } from '@/utils/constants';

const Course = ({ course }) => {
  const { workspace } = useWorkspace();
  const parentCourses = workspace?.creator?.guardianInformation?.parentTraining?.map(
    (training) => training?.courseCode ?? ''
  ) ?? [];
  const courseCode = course?.code ?? '';
  const guardianId = workspace?.creator?.guardianInformation?.id ?? null;
  const schoolYear = workspace?.studentRecord?.schoolYear ?? '';
  const [isSubmitting, setSubmittingState] = useState(false);

  const filteredTraining = workspace?.creator?.guardianInformation?.parentTraining
    ? workspace.creator.guardianInformation.parentTraining.find(
      (training) =>
        training.courseCode === courseCode &&
        training.schoolYear === schoolYear
    )
    : null;

  const courseComplete = () => {
    setSubmittingState(true);
    api('/api/parent-training', {
      body: {
        courseCode,
        guardianId,
        schoolYear,
        trainingStatus: 'FINISHED'
      },
      method: 'PATCH',
    })
      .then(response => {
        setSubmittingState(false);
        if (response.errors) {
          Object.keys(response.errors).forEach((error) =>
            toast.error(response.errors[error].msg)
          );
        } else {
          toast.success('Update training status success');
        }
      })
      .catch(error => {
        setSubmittingState(false);
        toast.error(`Error updating training status: ${error.message}`);
      });
  };

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
                <div className="mb-5 space-y-5">
                  {course.video.split(',').map((videoUrl, index) => (
                    <div key={index} className="aspect-w-16 aspect-h-9 rounded-xl overflow-clip">
                      <iframe
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        frameBorder="0"
                        src={videoUrl.trim()}
                      ></iframe>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body title="Course Lessons">
                {course.lessons?.map((lesson, index) => (
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

            {parentCourses.includes(course.code) ? (
              filteredTraining?.status !== 'FINISHED' ? (
                <Card>
                  <Card.Body title="Course Assessment">
                    <JotFormEmbed
                      src={`https://form.jotform.com/${PARENT_TRAINING_CODES[course.code].code}`}
                      scrolling={true}
                      style={{ height: '100%' }}
                    />
                    <div className="flex justify-center space-x-3 mt-3">
                      <button
                        onClick={courseComplete}
                        className="bg-blue-500 text-white px-3 py-1 rounded h-12"
                        disabled={isSubmitting}
                      >
                        Mark Course as Complete
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              ) : (
                <div className="flex justify-center mt-3">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full">
                    COURSE {filteredTraining?.status}
                  </span>
                </div>
              )
            ) : null}

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
