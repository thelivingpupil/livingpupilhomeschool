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
        setWorkspace(null);
        router.replace('/account');
        toast.success('Workspace has been deleted!');
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
            subtitle="The student record will be permanently deleted, including its contents and related information. This action is irreversible and cannot be undone."
          />
          <Card.Footer>
            <small className={[isCreator && 'text-red-600']}>
              {isCreator
                ? 'This action is not reversible. Please be certain.'
                : 'Please contact your team creator for the deletion of your workspace.'}
            </small>
            {isCreator && (
              <Button
                className="text-white bg-red-600 hover:bg-red-600"
                disabled={isSubmitting}
                onClick={toggleModal}
              >
                {isSubmitting ? 'Deleting' : 'Delete'}
              </Button>
            )}
          </Card.Footer>
          <Modal
            show={showModal}
            title="Deactivate Student Record"
            toggle={toggleModal}
          >
            <p className="flex flex-col">
              <span>
                Your student record will be deleted, along with all of its
                contents.
              </span>
              <span>
                Data associated with this student can't be accessed by invited
                members.
              </span>
            </p>
            <p className="px-3 py-2 text-red-600 border border-red-600 rounded">
              <strong>Warning:</strong> This action is not reversible. Please be
              certain.
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
                <span>Request Student Record Deletion</span>
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
