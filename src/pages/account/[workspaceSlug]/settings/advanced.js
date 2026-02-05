import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import Button from '@/components/Button/index';
import Meta from '@/components/Meta/index';
import Modal from '@/components/Modal/index';
import Card from '@/components/Card/index';
import Content from '@/components/Content/index';
import { AccountLayout } from '@/layouts/index';
import api from '@/lib/common/api';
import { useWorkspace } from '@/providers/workspace';
import { getSession } from 'next-auth/react';
import { getWorkspace, isWorkspaceCreator } from '@/prisma/services/workspace';

const Advanced = ({ isCreator }) => {
  const { setWorkspace, workspace } = useWorkspace();
  const router = useRouter();
  const [isSubmitting, setSubmittingState] = useState(false);
  const [showModal, setModalState] = useState(false);
  const [verifyWorkspace, setVerifyWorkspace] = useState('');
  const verifiedWorkspace = verifyWorkspace === workspace?.slug;

  const handleVerifyWorkspaceChange = (event) =>
    setVerifyWorkspace(event.target.value);

  const deleteWorkspace = () => {
    setSubmittingState(true);
    api(`/api/workspace/${workspace.slug}`, {
      method: 'DELETE',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toggleModal();
        toast.success('Deletion request sent to admin.');
      }
    });
  };

  const toggleModal = () => {
    setVerifyWorkspace('');
    setModalState(!showModal);
  };

  return (
    <AccountLayout>
      <Meta
        title={`Living Pupil Homeschool - ${workspace?.name} | Advanced Settings`}
      />
      <Content.Title
        title="Advanced Student Record Settings"
        subtitle="Manage your student records"
      />
      <Content.Divider />
      <Content.Container>
        <Card danger>
          <Card.Body
            title="Request Student Record Deletion"
            subtitle="This will send a deletion request to the admin. Your student record will not be deleted immediately."
          />
          <Card.Footer>
            <small className={[isCreator && 'text-red-600']}>
              {isCreator
                ? 'This sends a deletion request to admin for review.'
                : 'Please contact your team creator to request deletion.'}
            </small>
            {isCreator && (
              <Button
                className="text-white bg-red-600 hover:bg-red-600"
                disabled={isSubmitting}
                onClick={toggleModal}
              >
                {isSubmitting ? 'Sending request' : 'Request deletion'}
              </Button>
            )}
          </Card.Footer>
          <Modal
            show={showModal}
            title="Request Student Record Deletion"
            toggle={toggleModal}
          >
            <p className="flex flex-col">
              <span>
                This will send a deletion request to the admin.
              </span>
              <span>
                Your student record will remain accessible until the admin processes the request.
              </span>
            </p>
            <p className="px-3 py-2 text-red-600 border border-red-600 rounded">
              <strong>Note:</strong> This does not delete your record automatically.
            </p>
            <div className="flex flex-col">
              <label className="text-sm text-gray-400">
                Enter <strong>{workspace?.slug}</strong> to continue:
              </label>
              <input
                className="px-3 py-2 border rounded"
                disabled={isSubmitting}
                onChange={handleVerifyWorkspaceChange}
                type="email"
                value={verifyWorkspace}
              />
            </div>
            <div className="flex flex-col items-stretch">
              <Button
                className="text-white bg-red-600 hover:bg-red-600"
                disabled={!verifiedWorkspace || isSubmitting}
                onClick={deleteWorkspace}
              >
                <span>Send deletion request</span>
              </Button>
            </div>
          </Modal>
        </Card>
      </Content.Container>
    </AccountLayout>
  );
};

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  let isCreator = false;

  if (session) {
    const workspace = await getWorkspace(
      session.user.userId,
      session.user.email,
      context.params.workspaceSlug
    );
    isCreator = isWorkspaceCreator(session.user.userId, workspace.creatorId);
  }

  return { props: { isCreator } };
};

export default Advanced;
