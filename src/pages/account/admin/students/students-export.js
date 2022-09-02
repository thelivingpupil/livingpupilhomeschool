import { CSVLink } from 'react-csv';
import format from 'date-fns/format';

import Content from '@/components/Content';
import Meta from '@/components/Meta';
import AdminLayout from '@/layouts/AdminLayout';
import prisma from '@/prisma/index';
import Card from '@/components/Card';

const StudentsExport = ({ data }) => {
  const headers = [
    { key: 'studentId', label: 'Student ID ' },
    { key: 'firstName', label: 'First Name' },
    { key: 'middleName', label: 'Middle Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'birthDate', label: 'Birth Date' },
    { key: 'gender', label: 'Gender' },
    { key: 'religion', label: 'Religion' },
    { key: 'incomingGradeLevel', label: 'Grade Level' },
    { key: 'enrollmentType', label: 'Enrollment Type' },
    { key: 'program', label: 'Program' },
    { key: 'accreditation', label: 'Accreditation' },
    { key: 'reason', label: 'Homeschooling Reason' },
    { key: 'formerSchoolName', label: 'Former School Name' },
    { key: 'formerSchoolAddress', label: 'Former School Address' },
    { key: 'image', label: 'Student Picture' },
    { key: 'liveBirthCertificate', label: 'Live Birth Certificate' },
    { key: 'reportCard', label: 'Report Card' },
    { key: 'createdAt', label: 'Enrollment Date' },
    { key: 'student.name', label: 'Student Record Alias ' },
    { key: 'student.slug', label: 'Student Record Unique Key' },
    { key: 'student.creator.email', label: 'Account Email' },
    { key: 'student.creator.emailVerified', label: 'Date Verified' },
    {
      key: 'student.creator.guardianInformation.primaryGuardianName',
      label: 'Primary Guardian Name',
    },
    {
      key: 'student.creator.guardianInformation.primaryGuardianOccupation',
      label: 'Primary Guardian Occupation',
    },
    {
      key: 'student.creator.guardianInformation.primaryGuardianProfile',
      label: 'Primary Guardian Facebook Profile',
    },
    {
      key: 'student.creator.guardianInformation.primaryGuardianType',
      label: 'Primary Guardian Type',
    },
    {
      key: 'student.creator.guardianInformation.secondaryGuardianName',
      label: 'Secondary Guardian Name',
    },
    {
      key: 'student.creator.guardianInformation.secondaryGuardianOccupation',
      label: 'Secondary Guardian Occupation',
    },
    {
      key: 'student.creator.guardianInformation.secondaryGuardianProfile',
      label: 'Secondary Guardian Facebook Profile',
    },
    {
      key: 'student.creator.guardianInformation.secondaryGuardianType',
      label: 'Secondary Guardian Type',
    },
    {
      key: 'student.creator.guardianInformation.address1',
      label: 'Address Line 1',
    },
    {
      key: 'student.creator.guardianInformation.address2',
      label: 'Address Line 2',
    },
    {
      key: 'student.creator.guardianInformation.anotherEmail',
      label: 'Secondary Email',
    },
    {
      key: 'student.creator.guardianInformation.mobileNumber',
      label: 'Mobile Number',
    },
    {
      key: 'student.creator.guardianInformation.telephoneNumber',
      label: 'Telephone Number',
    },
  ];

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Students Export" />
      <Content.Title
        title="Download Students Master List"
        subtitle="Export and download students list"
      />
      <Content.Divider />
      <CSVLink
        className="items-center px-3 py-3 space-x-2 text-sm text-center text-white rounded bg-primary-500 hover:bg-secondary-500 hover:text-primary-600"
        data={data}
        filename={`students-export-${format(
          new Date(),
          'yyyy.MM.dd.kk.mm.ss'
        )}.csv`}
        headers={headers}
      >
        Download Students Master List and References
      </CSVLink>
      <Card>
        <Card.Body title="Current Students Statistics"></Card.Body>
      </Card>
    </AdminLayout>
  );
};

export const getServerSideProps = async () => {
  const data = await prisma.studentRecord.findMany({
    orderBy: [{ createdAt: 'asc' }],
    select: {
      studentId: true,
      firstName: true,
      middleName: true,
      lastName: true,
      birthDate: true,
      gender: true,
      religion: true,
      incomingGradeLevel: true,
      enrollmentType: true,
      program: true,
      accreditation: true,
      reason: true,
      formerSchoolName: true,
      formerSchoolAddress: true,
      image: true,
      liveBirthCertificate: true,
      reportCard: true,
      createdAt: true,
      student: {
        select: {
          name: true,
          slug: true,
          creator: {
            select: {
              email: true,
              emailVerified: true,
              guardianInformation: {
                select: {
                  primaryGuardianName: true,
                  primaryGuardianOccupation: true,
                  primaryGuardianProfile: true,
                  primaryGuardianType: true,
                  secondaryGuardianName: true,
                  secondaryGuardianOccupation: true,
                  secondaryGuardianProfile: true,
                  secondaryGuardianType: true,
                  address1: true,
                  address2: true,
                  anotherEmail: true,
                  mobileNumber: true,
                  telephoneNumber: true,
                },
              },
            },
          },
        },
      },
    },
    where: { deletedAt: null },
  });
  return { props: { data: JSON.parse(JSON.stringify(data)) } };
};

export default StudentsExport;
