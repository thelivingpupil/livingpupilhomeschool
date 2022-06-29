import { useState } from 'react';

import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import Card from '@/components/Card';
import { GRADE_LEVEL } from '@/utils/constants';
import { useStudents } from '@/hooks/data';

const Students = () => {
  const { data, isLoading } = useStudents();
  const [showModal, setModalVisibility] = useState(false);

  const toggleModal = () => setModalVisibility(!showModal);

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Students List" />
      <SideModal show={showModal} toggle={toggleModal} />
      <Content.Title
        title="Students List"
        subtitle="View and manage all student records and related data"
      />
      <Content.Divider />
      <Card>
        <Card.Body title="List of Enrolled Students">
          <div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200 border-t border-b border-t-gray-300 border-b-gray-300">
                  <th className="p-2 font-medium text-left">Name</th>
                  <th className="p-2 font-medium text-center">
                    Primary Guardian
                  </th>
                </tr>
              </thead>
              <tbody>
                {!isLoading ? (
                  data ? (
                    data.students.map((student, index) => (
                      <tr
                        key={index}
                        className="text-sm border-t border-b hover:bg-gray-100 border-b-gray-300"
                      >
                        <td className="p-2 space-x-3 text-left">
                          <div>
                            <h4 className="flex items-center text-xl font-medium capitalize text-primary-500">
                              <span>{`${student.firstName} ${student.lastName}`}</span>
                            </h4>
                            <h5 className="flex items-center font-medium text-gray-400">
                              <span className="text-xs">
                                {GRADE_LEVEL[student.incomingGradeLevel]}
                              </span>
                            </h5>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <p className="font-medium capitalize">
                            {
                              student.student.creator?.guardianInformation
                                ?.primaryGuardianName
                            }
                          </p>
                          <p className="text-sm text-gray-400 capitalize">
                            {student.student.creator?.guardianInformation?.primaryGuardianType?.toLowerCase()}
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2}>No records found...</td>
                    </tr>
                  )
                ) : (
                  <tr>
                    <td className="px-3 py-1 text-center" colSpan={2}>
                      Fetching records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </AdminLayout>
  );
};

export default Students;
