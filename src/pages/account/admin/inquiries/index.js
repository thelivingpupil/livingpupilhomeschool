import { useState } from 'react';
import formatDistance from 'date-fns/formatDistance';

import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import { useInquiries } from '@/hooks/data';
import Card from '@/components/Card';

const Inquiries = () => {
  const { data, isLoading } = useInquiries();
  const [showModal, setModalVisibility] = useState(false);
  const [inquiry, setInquiry] = useState(null);

  const toggleModal = () => setModalVisibility(!showModal);

  const view = (inquiry) => {
    toggleModal();
    setInquiry(inquiry);
  };

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Students List" />
      {inquiry && (
        <SideModal
          title={inquiry.subject}
          show={showModal}
          toggle={toggleModal}
        >
          <div className="space-y-5">
            <div className="flex flex-col">
              <h4 className="text-xl font-medium capitalize text-primary-500">
                {inquiry.name}
              </h4>
              <h5 className="font-medium">
                <span className="text-xs text-gray-400">{inquiry.email}</span>
              </h5>
            </div>
            <div className="p-5 border rounded">
              <p>{inquiry.message}</p>
            </div>
            <div className="flex items-center justify-end">
              <a
                className="inline-block px-3 py-2 text-white rounded bg-primary-500 hover:bg-primary-400"
                href={`mailto:${inquiry.email}?subject=${encodeURI(
                  `Re:${inquiry.subject}`
                )}`}
              >
                Reply
              </a>
            </div>
          </div>
        </SideModal>
      )}
      <Content.Title
        title="Contact Form Inquiries"
        subtitle="View and manage all inquiries made from the website"
      />
      <Content.Divider />
      <Content.Container>
        <Card>
          <Card.Body title="Inquiry List">
            <div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200 border-t border-b border-t-gray-300 border-b-gray-300">
                    <th className="p-2 font-medium text-left">Sender</th>
                    <th className="p-2 font-medium text-left">Subject</th>
                    <th className="p-2 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!isLoading ? (
                    data ? (
                      data.inquiries.map((inquiry, index) => (
                        <tr
                          key={index}
                          className="text-sm border-t border-b hover:bg-gray-100 border-b-gray-300"
                        >
                          <td className="p-2 text-left">
                            <div>
                              <h4 className="text-xl font-medium capitalize text-primary-500">
                                {`${inquiry.name}`}
                              </h4>
                              <h5 className="font-bold">
                                <span className="text-xs">{inquiry.email}</span>
                              </h5>
                            </div>
                          </td>
                          <td className="p-2 text-left">
                            <p className="font-medium capitalize">
                              {inquiry.subject.trim().substring(0, 32)}...
                            </p>
                            <p className="text-xs text-gray-400">
                              Messaged{' '}
                              {new Date(inquiry.createdAt).toDateString()}
                            </p>
                          </td>
                          <td className="p-2 space-x-2 text-xs text-center">
                            <button
                              className="px-3 py-1 text-white rounded bg-primary-500"
                              onClick={() => view(inquiry)}
                            >
                              View Message
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
                      <td className="px-3 py-1 text-center" colSpan={5}>
                        Fetching records
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </Content.Container>
    </AdminLayout>
  );
};

export default Inquiries;
