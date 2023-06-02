import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from '@heroicons/react/outline';

import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import Card from '@/components/Card';
import {
  ACCREDITATION,
  ACCREDITATION_NEW,
  ENROLLMENT_TYPE,
  GRADE_LEVEL,
  PROGRAM,
  RELIGION,
} from '@/utils/constants';
import { useStudents } from '@/hooks/data';
import { UserIcon } from '@heroicons/react/solid';
import Image from 'next/image';
import format from 'date-fns/format';
import differenceInYears from 'date-fns/differenceInYears';

const filterValueOptions = {
  accreditation: ACCREDITATION_NEW,
  enrollmentType: ENROLLMENT_TYPE,
  gender: {
    FEMALE: 'Female',
    MALE: 'Male',
  },
  incomingGradeLevel: GRADE_LEVEL,
  program: PROGRAM,
  religion: RELIGION,
};

const filterByOptions = {
  accreditation: 'Accreditation',
  enrollmentType: 'Enrollment Type',
  gender: 'Gender',
  incomingGradeLevel: 'Grade Level',
  program: 'Program',
  religion: 'Religion',
};

const Students = () => {
  const { data, isLoading } = useStudents();
  const [showModal, setModalVisibility] = useState(false);
  const [filter, setFilter] = useState(['', '']);

  const [filterBy, filterValue] = filter;

  const [student, setStudent] = useState(null);

  const filterStudents = useMemo(() => {
    if (!filterBy || !filterValue) return data?.students;

    return data?.students?.filter(
      (student) => student[filterBy] === filterValue
    );
  }, [data, filterBy, filterValue]);

  const toggleModal = () => setModalVisibility(!showModal);

  const view = (student) => {
    toggleModal();
    setStudent(student);
  };

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Students List" />
      {student && (
        <SideModal
          title={`${student.firstName} ${student.lastName}`}
          show={showModal}
          toggle={toggleModal}
        >
          <div className="space-y-5">
            <div className="flex flex-col">
              <h4 className="text-xl font-medium text-primary-500">
                {GRADE_LEVEL[student.incomingGradeLevel]}
              </h4>
              <h5 className="font-medium">
                Parent/Guardian:{' '}
                <span className="text-xs text-gray-400">
                  {
                    student.student.creator?.guardianInformation
                      ?.primaryGuardianName
                  }
                </span>
              </h5>
            </div>
            <h2 className="font-medium">Documents:</h2>
            {student.image ? (
              <div className="flex flex-col p-3 space-y-2 border rounded">
                <h3 className="text-2xl font-medium">Student Picture</h3>
                <div className="flex items-center space-x-3">
                  <Link href={student.image}>
                    <a className="underline text-primary-500" target="_blank">
                      View Student Picture
                    </a>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm">- No Image Uploaded</p>
            )}
            {student.liveBirthCertificate ? (
              <div className="flex flex-col p-3 space-y-2 border rounded">
                <h3 className="text-2xl font-medium">Birth Certificate</h3>
                <div className="flex items-center space-x-3">
                  <Link href={student.liveBirthCertificate}>
                    <a className="underline text-primary-500" target="_blank">
                      View Uploaded Document
                    </a>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm">- No Birth Certificate Uploaded</p>
            )}
            {student.reportCard ? (
              <div className="flex flex-col p-3 space-y-2 border rounded">
                <h3 className="text-2xl font-medium">Report Card</h3>
                <div className="flex items-center space-x-3">
                  <Link href={student.reportCard}>
                    <a className="underline text-primary-500" target="_blank">
                      View Uploaded Document
                    </a>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm">- No Report Card Uploaded</p>
            )}
            <hr className="border-2 border-gray-600" />
            <h2 className="font-medium">Student Details:</h2>
            <div className="flex flex-col p-3 space-y-2 border rounded">
              <h4 className="font-bold text-gray-600">Student ID</h4>
              <h3 className="font-mono font-medium text-gray-400">
                {student.studentId.toUpperCase()}
              </h3>
              <hr className="border-gray-400 border-dashed" />
              <h4 className="font-bold text-gray-600">
                Program and Accreditation
              </h4>
              <p className="text-lg">
                {PROGRAM[student.program]} -{' '}
                {ACCREDITATION[student.accreditation]}
              </p>
              <h4 className="font-bold text-gray-600">Birth Date</h4>
              <p className="text-lg">
                {format(new Date(student.birthDate), 'MMMM dd, yyyy')} (
                {differenceInYears(new Date(), new Date(student.birthDate))}{' '}
                years old )
              </p>
              <h4 className="font-bold text-gray-600">Former School</h4>
              <p className="text-lg capitalize">{student.formerSchoolName}</p>
              <p className="text-base">{student.formerSchoolAddress}</p>
              <h4 className="font-bold text-gray-600">Grade Level</h4>
              <p className="text-lg">
                {GRADE_LEVEL[student.incomingGradeLevel]}
              </p>
              <h4 className="font-bold text-gray-600">Gender</h4>
              <p className="text-lg capitalize">
                {student.gender.toLowerCase()}
              </p>
              <h4 className="font-bold text-gray-600">Religion</h4>
              <p className="text-lg capitalize">{RELIGION[student.religion]}</p>
            </div>
            <hr className="border-2 border-gray-600" />
            <h2 className="font-medium">School Fees:</h2>
            <div className="flex flex-col p-3 space-y-2 border rounded"></div>
          </div>
        </SideModal>
      )}
      <Content.Title
        title="Students List"
        subtitle="View and manage all student records and related data"
      />
      <Content.Divider />
      <Card>
        <Card.Body title="List of Enrolled Students">
          <div>
            <Link href="/account/admin/students/students-export">
              <a className="items-center px-3 py-2 space-x-2 text-sm text-white rounded bg-primary-500 hover:bg-primary-600">
                Generate Students Master List
              </a>
            </Link>
          </div>
          <div className="py-4">
            <div className="flex flex-col md:flex-row space-y-3 md:space-x-5 md:items-center">
              <div>Filter By:</div>
              <div className="flex flex-row md:w-1/4">
                <div className="relative inline-block w-full rounded border">
                  <select
                    className="w-full px-3 py-2 capitalize rounded appearance-none"
                    onChange={(e) => setFilter([e.target.value, ''])}
                    value={filterBy}
                  >
                    <option value="">-</option>
                    {Object.entries(filterByOptions).map(([value, name]) => (
                      <option key={value} value={value}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDownIcon className="w-5 h-5" />
                  </div>
                </div>
              </div>
              {!!filterBy && (
                <div className="flex flex-row md:w-1/4">
                  <div className="relative inline-block w-full rounded border">
                    <select
                      className="w-full px-3 py-2 capitalize rounded appearance-none"
                      onChange={(e) => setFilter([filterBy, e.target.value])}
                      value={filterValue}
                    >
                      <option value="">-</option>
                      {Object.entries(filterValueOptions[filterBy]).map(
                        ([value, name]) => (
                          <option key={value} value={value}>
                            {name}
                          </option>
                        )
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDownIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200 border-t border-b border-t-gray-300 border-b-gray-300">
                  <th className="p-2 font-medium text-left">Name</th>
                  <th className="p-2 font-medium text-center">
                    Primary Guardian
                  </th>
                  <th className="p-2 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading ? (
                  data ? (
                    filterStudents.map((student, index) => (
                      <tr
                        key={index}
                        className="text-sm border-t border-b hover:bg-gray-100 border-b-gray-300"
                      >
                        <td className="p-2 space-x-3 text-left">
                          <div className="flex space-x-3">
                            <div className="flex items-center justify-center w-12 h-12 overflow-hidden text-white bg-gray-400 rounded-full">
                              {student.image ? (
                                <div className="relative w-12 h-12 rounded-full">
                                  <Image
                                    alt={student.image}
                                    className="rounded-full"
                                    layout="fill"
                                    loading="lazy"
                                    objectFit="cover"
                                    objectPosition="top"
                                    src={student.image}
                                  />
                                </div>
                              ) : (
                                <UserIcon className="w-8 h-8" />
                              )}
                            </div>
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
                        <td className="p-2 space-x-2 text-xs text-center">
                          <button
                            className="px-3 py-1 text-white rounded bg-primary-500 hover:bg-primary-400"
                            onClick={() => {
                              view(student);
                            }}
                          >
                            View Record
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>No records found...</td>
                    </tr>
                  )
                ) : (
                  <tr>
                    <td className="px-3 py-1 text-center" colSpan={3}>
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
