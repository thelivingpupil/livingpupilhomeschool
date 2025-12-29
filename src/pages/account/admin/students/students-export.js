import { CSVLink } from 'react-csv';
import format from 'date-fns/format';
import { TransactionStatus } from '@prisma/client';

import Content from '@/components/Content';
import Meta from '@/components/Meta';
import AdminLayout from '@/layouts/AdminLayout';
import prisma from '@/prisma/index';
import Card from '@/components/Card';

const StudentsExport = ({ data }) => {
  // const headers = [
  //   { label: 'First Name', key: 'firstname' },
  //   { label: 'Last Name', key: 'lastname' },
  //   { label: 'Email', key: 'email' },
  // ];

  // const sampleData = [
  //   { firstname: 'Ahmed', lastname: 'Tomi', email: 'ah@smthing.co.com' },
  //   { firstname: 'Raed', lastname: 'Labes', email: 'rl@smthing.co.com' },
  //   { firstname: 'Yezzi', lastname: 'Min l3b', email: 'ymin@cocococo.com' },
  // ];
  const headers = [
    { key: 'studentId', label: 'Student ID ' },
    { key: 'firstName', label: 'First Name' },
    { key: 'middleName', label: 'Middle Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'birthDate', label: 'Birth Date' },
    { key: 'gender', label: 'Gender' },
    { key: 'religion', label: 'Religion' },
    { key: 'incomingGradeLevel', label: 'Grade Level' },
    { key: 'schoolYear', label: 'School Year' },
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
    {
      key: 'primaryTeacherName',
      label: 'Primary Teacher Name',
    },
    {
      key: 'primaryTeacherAge',
      label: 'Primary Teacher Age',
    },
    {
      key: 'primaryTeacherEducation',
      label: 'Primary Teacher Education',
    },
    {
      key: 'primaryTeacherProfile',
      label: 'Primary Teacher Profile',
    },
    {
      key: 'primaryTeacherRelationship',
      label: 'Relationship with the student',
    },
    { key: 'formerRegistrar', label: 'Former Registrar' },
    { key: 'formerRegistrarEmail', label: 'Former Registrar Email' },
    { key: 'formerRegistrarNumber', label: 'Former Registrar No.' },
    { key: 'specialNeedSpecific', label: 'Special Needs' },
    { key: 'studentAddress1', label: 'Student Address 1' },
    { key: 'studentAddress2', label: 'Student Address 2' },
    { key: 'studentInternationalAddress', label: 'Student International Address' },
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
        asyncOnClick
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
    orderBy: [{ createdAt: 'desc' }],
    select: {
      studentId: true,
      firstName: true,
      middleName: true,
      lastName: true,
      birthDate: true,
      gender: true,
      religion: true,
      incomingGradeLevel: true,
      schoolYear: true,
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
      primaryTeacherName: true,
      primaryTeacherAge: true,
      primaryTeacherEducation: true,
      primaryTeacherProfile: true,
      primaryTeacherRelationship: true,
      formerRegistrar: true,
      formerRegistrarEmail: true,
      formerRegistrarNumber: true,
      specialNeeds: true,
      specialNeedSpecific: true,
      studentAddress1: true,
      studentAddress2: true,
      studentInternationalAddress: true,
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
    where: {
      deletedAt: null,
      student: {
        deletedAt: null,
        schoolFees: {
          some: {
            transaction: {
              paymentStatus: TransactionStatus.S,
            },
          },
        },
      },
    },
  });
  const formattedData = data.map(student => {
    return {
      ...student,
      birthDate: format(new Date(student.birthDate), 'yyyy-MM-dd'),
      createdAt: format(new Date(student.createdAt), 'yyyy-MM-dd'), // Adjust the format as needed
      'student.creator.emailVerified': format(new Date(student.student.creator.emailVerified), 'yyyy-MM-dd'),
    };
  });
  return { props: { data: JSON.parse(JSON.stringify(formattedData)) } };
};

export default StudentsExport;
