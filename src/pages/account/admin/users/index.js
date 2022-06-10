import { useState } from 'react';

import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';

const Users = () => {
  const [showModal, setModalVisibility] = useState(false);

  const toggleModal = () => setModalVisibility(!showModal);

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Users" />
      <SideModal show={showModal} toggle={toggleModal} />
      <Content.Title
        title="Users List"
        subtitle="View and manage all user details and related data"
      />
      <Content.Divider />
    </AdminLayout>
  );
};

export default Users;
