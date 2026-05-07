import { useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import EnrollSchoolYearModal from '@/components/account/EnrollSchoolYearModal';
import Button from '@/components/Button/index';
import Card from '@/components/Card/index';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import { AccountLayout } from '@/layouts/index';

const StudentSchoolYears = () => {
  const router = useRouter();
  const { studentKey } = router.query;
  const [enrollOpen, setEnrollOpen] = useState(false);

  const { data, error, isLoading, mutate } = useSWR(
    router.isReady && studentKey
      ? `/api/account/students/${encodeURIComponent(studentKey)}`
      : null
  );

  const payload = data?.data;
  const enrollments = payload?.enrollments ?? [];
  const legacySchoolYear = payload?.legacySchoolYear;
  const fullName = payload?.fullName;
  const workspaceSlug = payload?.workspaceSlug;

  const showLegacyRow =
    legacySchoolYear &&
    !enrollments.some((e) => e.schoolYear?.name === legacySchoolYear);

  const enrolledSchoolYearNames = enrollments
    .map((e) => e.schoolYear?.name)
    .filter(Boolean);

  return (
    <AccountLayout>
      <Meta
        title={
          fullName
            ? `${fullName} — School years`
            : 'Student — School years'
        }
      />
      <Content.Title
        title={fullName || 'Student'}
        subtitle="School years on record"
      />
      <Content.Divider />
      <Content.Container>
        <div className="mb-6 flex flex-wrap gap-3">
          <Button
            className="border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
            onClick={() => router.push('/account')}
            type="button"
          >
            &larr; Back to students
          </Button>
          {router.isReady && studentKey && payload && (
            <Button
              className="text-white bg-primary-600 hover:bg-primary-600"
              onClick={() => setEnrollOpen(true)}
              type="button"
            >
              Enroll
            </Button>
          )}
        </div>

        {router.isReady && studentKey && (
          <EnrollSchoolYearModal
            enrolledSchoolYearNames={enrolledSchoolYearNames}
            onSuccess={() => mutate()}
            previousEnrollment={enrollments[0] ?? null}
            show={enrollOpen}
            studentKey={String(studentKey)}
            studentRecord={payload?.studentRecord ?? null}
            toggle={() => setEnrollOpen(false)}
            workspaceSlug={workspaceSlug || ''}
          />
        )}

        {isLoading && (
          <Card>
            <Card.Body />
          </Card>
        )}

        {error && (
          <Card>
            <Card.Body title="Unable to load student">
              <p className="text-sm text-red-600">
                {error.status === 404
                  ? 'This student was not found or you do not have access.'
                  : 'Something went wrong. Try again later.'}
              </p>
            </Card.Body>
          </Card>
        )}

        {!isLoading && !error && payload && (
          <>
            {enrollments.length === 0 && !legacySchoolYear && (
              <p className="text-sm text-gray-600">
                No school year enrollments on file yet.
              </p>
            )}

            {(enrollments.length > 0 || showLegacyRow) && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {enrollments.map((en) => (
                  <Card key={en.id}>
                    <Card.Body
                      title={en.schoolYear?.name ?? 'School year'}
                      subtitle={
                        en.enrollmentStatus
                          ? `Status: ${en.enrollmentStatus.replace(/_/g, ' ')}`
                          : undefined
                      }
                    />
                    <Card.Footer>
                      <Button
                        className="text-white bg-primary-600 hover:bg-primary-600 w-full"
                        disabled={!workspaceSlug}
                        onClick={() =>
                          workspaceSlug &&
                          router.push(`/account/${workspaceSlug}`)
                        }
                        type="button"
                      >
                        View Record
                      </Button>
                    </Card.Footer>
                  </Card>
                ))}

                {showLegacyRow && (
                  <Card>
                    <Card.Body
                      title={legacySchoolYear}
                      subtitle="From student record (legacy)"
                    />
                    <Card.Footer>
                      <Button
                        className="text-white bg-primary-600 hover:bg-primary-600 w-full"
                        disabled={!workspaceSlug}
                        onClick={() =>
                          workspaceSlug &&
                          router.push(`/account/${workspaceSlug}`)
                        }
                        type="button"
                      >
                        View Record
                      </Button>
                    </Card.Footer>
                  </Card>
                )}
              </div>
            )}

            {enrollments.length > 0 &&
              legacySchoolYear &&
              enrollments.some((e) => e.schoolYear?.name === legacySchoolYear) && (
                <p className="mt-4 text-xs text-gray-500">
                  Legacy record matches a listed enrollment year.
                </p>
              )}
          </>
        )}
      </Content.Container>
    </AccountLayout>
  );
};

export default StudentSchoolYears;
