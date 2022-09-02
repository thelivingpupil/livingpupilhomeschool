import { CSVLink } from 'react-csv';
import format from 'date-fns/format';

import Content from '@/components/Content';
import Meta from '@/components/Meta';
import AdminLayout from '@/layouts/AdminLayout';
import prisma from '@/prisma/index';
import Card from '@/components/Card';

const UsersExport = ({ data }) => {
  const headers = [
    { key: 'id', label: 'ID Number' },
    { key: 'userCode', label: 'Account Code' },
    { key: 'name', label: 'Account Name' },
    { key: 'email', label: 'Account Email' },
    { key: 'emailVerified', label: 'Date Verified' },
    { key: 'image', label: 'Picture' },
    { key: 'createdAt', label: 'Date Joined' },
    {
      key: 'guardianInformation.primaryGuardianName',
      label: 'Primary Guardian Name',
    },
    {
      key: 'guardianInformation.primaryGuardianOccupation',
      label: 'Primary Guardian Occupation',
    },
    {
      key: 'guardianInformation.primaryGuardianProfile',
      label: 'Primary Guardian Facebook Profile',
    },
    {
      key: 'guardianInformation.primaryGuardianType',
      label: 'Primary Guardian Role',
    },
    {
      key: 'guardianInformation.secondaryGuardianName',
      label: 'Secondary Guardian Name',
    },
    {
      key: 'guardianInformation.secondaryGuardianOccupation',
      label: 'Secondary Guardian Occupation',
    },
    {
      key: 'guardianInformation.secondaryGuardianProfile',
      label: 'Secondary Guardian Facebook Profile',
    },
    {
      key: 'guardianInformation.secondaryGuardianType',
      label: 'Secondary Guardian Role',
    },
    { key: 'guardianInformation.address1', label: 'Address Line 1' },
    { key: 'guardianInformation.address2', label: 'Address Line 2' },
    { key: 'guardianInformation.anotherEmail', label: 'Secondary Email' },
    { key: 'guardianInformation.mobileNumber', label: 'Mobile Number' },
    { key: 'guardianInformation.telephoneNumber', label: 'Telephone Number' },
  ];

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Users Export" />
      <Content.Title
        title="Download Users Master List"
        subtitle="Export and download users list"
      />
      <Content.Divider />
      <CSVLink
        className="items-center px-3 py-3 space-x-2 text-sm text-center text-white rounded bg-primary-500 hover:bg-secondary-500 hover:text-primary-600"
        data={data}
        filename={`users-export-${format(
          new Date(),
          'yyyy.MM.dd.kk.mm.ss'
        )}.csv`}
        headers={headers}
      >
        Download Users Master List and References
      </CSVLink>
      <Card>
        <Card.Body title="Current User Statistics"></Card.Body>
      </Card>
    </AdminLayout>
  );
};

export const getServerSideProps = async () => {
  const data = await prisma.user.findMany({
    orderBy: [{ createdAt: 'asc' }],
    select: {
      id: true,
      userCode: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      createdAt: true,
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
    where: { deletedAt: null },
  });
  return { props: { data: JSON.parse(JSON.stringify(data)) } };
};

export default UsersExport;
