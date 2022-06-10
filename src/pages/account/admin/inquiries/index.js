import { useState } from 'react';

import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';

const Shop = () => {
  const [showModal, setModalVisibility] = useState(false);

  const toggleModal = () => setModalVisibility(!showModal);

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Students List" />
      <SideModal show={showModal} toggle={toggleModal} />
      <Content.Title
        title="Contact Form Inquiries"
        subtitle="View and manage all inquiries made from the website"
      />
      <Content.Divider />
    </AdminLayout>
  );
};

export default Shop;
