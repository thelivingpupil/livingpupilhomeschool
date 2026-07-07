import { PortableText } from '@portabletext/react';
import { useEffect, useState } from 'react';
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
  const { workspace, setWorkspace } = useWorkspace();
  const parentCourses = workspace?.creator?.guardianInformation?.parentTraining?.map(
    (training) => training?.courseCode ?? ''
  ) ?? [];
  const courseCode = course?.code ?? '';
  const guardianId = workspace?.creator?.guardianInformation?.id ?? null;
  const schoolYear = workspace?.studentRecord?.schoolYear ?? '';
  const [isSubmitting, setSubmittingState] = useState(false);
  const [isTrainingFinished, setTrainingFinishedState] = useState(false);

  const filteredTraining = workspace?.creator?.guardianInformation?.parentTraining
    ? workspace.creator.guardianInformation.parentTraining.find(
      (training) =>
        training.courseCode === courseCode &&
        training.schoolYear === schoolYear
    )
    : null;

  useEffect(() => {
    setTrainingFinishedState(filteredTraining?.status === 'FINISHED');
  }, [filteredTraining?.status]);

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
          setTrainingFinishedState(true);
          if (workspace?.creator?.guardianInformation?.parentTraining) {
            setWorkspace({
              ...workspace,
              creator: {
                ...workspace.creator,
                guardianInformation: {
                  ...workspace.creator.guardianInformation,
                  parentTraining:
                    workspace.creator.guardianInformation.parentTraining.map(
                      (training) =>
                        training.courseCode === courseCode &&
                          training.schoolYear === schoolYear
                          ? { ...training, status: 'FINISHED' }
                          : training
                    ),
                },
              },
            });
          }
          toast.success('Update training status success');
        }
      })
      .catch(error => {
        setSubmittingState(false);
        toast.error(`Error updating training status: ${error.message}`);
      });
  };

  return (
    <AccountLayout>
      {workspace ? (
        <>
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
                    {course.video && course.video.includes(',')
                      ? course.video.split(',').map((videoUrl, index) => (
                        <div key={index} className="aspect-w-16 aspect-h-9 rounded-xl overflow-clip">
                          <iframe
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            frameBorder="0"
                            src={videoUrl.trim()}
                          ></iframe>
                        </div>
                      ))
                      : course.video ? (
                        <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-clip">
                          <iframe
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            frameBorder="0"
                            src={course.video.trim()}
                          ></iframe>
                        </div>
                      ) : null
                    }
                  </div>
                </Card.Body>
              </Card>
              {course.courseFile?.url ? (
                <Card>
                  <Card.Body title="Training Manual">
                    <a
                      className="inline-flex items-center self-start py-2 px-3 rounded bg-primary-600 text-white text-sm cursor-pointer hover:bg-primary-500"
                      href={
                        course.courseFile.fileName
                          ? `${course.courseFile.url}?dl=${encodeURIComponent(course.courseFile.fileName)}`
                          : course.courseFile.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Training Manual
                    </a>
                  </Card.Body>
                </Card>
              ) : null}
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
                <Card>
                  <Card.Body title="Course Assessment">
                    {!isTrainingFinished && PARENT_TRAINING_CODES[course.code] ? (
                      <JotFormEmbed
                        src={`https://form.jotform.com/${PARENT_TRAINING_CODES[course.code].code}`}
                        scrolling={true}
                        style={{ height: '100%' }}
                      />
                    ) : null}
                    {isTrainingFinished ? (
                      <div className="flex justify-center mt-3">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full">
                          COURSE FINISHED
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-center space-x-3 mt-3">
                        <button
                          onClick={courseComplete}
                          className="bg-blue-500 text-white px-3 py-1 rounded h-12"
                          disabled={isSubmitting}
                        >
                          Mark Course as Complete
                        </button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
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
        </>
      ) : null}
    </AccountLayout>
  );
};

export const getServerSideProps = async ({ params }) => {
  const { code } = params;
  const course = await sanityClient.fetch(
    `*[_type == 'courses' && code == $code && !(_id in path("drafts.**"))][0]{
      ...,
      courseFile {
        'url': asset->url,
        'fileName': asset->originalFilename
      }
    }`,
    { code }
  );

  if (!course) {
    return { notFound: true };
  }

  return { props: { course } };
};

export default Course;
