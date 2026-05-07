import { useRouter } from 'next/router';

import Button from '@/components/Button/index';
import Card from '@/components/Card/index';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import { useParentStudents } from '@/hooks/data/index';
import { AccountLayout } from '@/layouts/index';

const StudentsHome = () => {
  const router = useRouter();
  const { data: studentsData, isLoading } = useParentStudents();

  const students = studentsData?.students;

  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - Students" />

      <Content.Title
        title="Students"
        subtitle="Select a student to view school years and enrollment"
      />
      <Content.Divider />
      <Content.Container>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 tourDashboard">
          {isLoading ? (
            <Card>
              <Card.Body />
              <Card.Footer />
            </Card>
          ) : students?.length > 0 ? (
            students.map((student) => (
              <Card key={student.studentKey}>
                <Card.Body title={student.fullName} />
                <Card.Footer>
                  <Button
                    className="text-white bg-primary-600 hover:bg-primary-600 w-full"
                    onClick={() =>
                      router.push(`/account/students/${student.studentKey}`)
                    }
                  >
                    View Student
                  </Button>
                </Card.Footer>
              </Card>
            ))
          ) : (
            <Card.Empty>
              No students yet. Use <strong>Add Student</strong> in the sidebar
              to add one.
            </Card.Empty>
          )}
        </div>
      </Content.Container>
    </AccountLayout>
  );
};

export default StudentsHome;
