import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import Button from '@/components/Button/index';
import Card from '@/components/Card/index';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import { useInvitations, useWorkspaces } from '@/hooks/data/index';
import { AccountLayout } from '@/layouts/index';
import api from '@/lib/common/api';
import { useWorkspace } from '@/providers/workspace';
import { PlusIcon } from '@heroicons/react/outline';
import Modal from '@/components/Modal';
import { BadgeCheckIcon, ExclamationIcon } from '@heroicons/react/solid';

const Welcome = () => {
  const router = useRouter();
  const { data: invitationsData, isLoading: isFetchingInvitations } =
    useInvitations();
  const { data: workspacesData, isLoading: isFetchingWorkspaces } =
    useWorkspaces();
  const { setWorkspace } = useWorkspace();
  const [name, setName] = useState('');
  const [isSubmitting, setSubmittingState] = useState(false);
  const [showModal, setModalState] = useState(false);
  const validName = name.length > 0 && name.length <= 64;

  const accept = (memberId) => {
    setSubmittingState(true);
    api(`/api/workspace/team/accept`, {
      body: { memberId },
      method: 'PUT',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toast.success('Accepted invitation!');
      }
    });
  };

  const createWorkspace = (event) => {
    event.preventDefault();
    setSubmittingState(true);
    api('/api/workspace', {
      body: { name },
      method: 'POST',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toggleModal();
        setName('');
        toast.success('Workspace successfully created!');
      }
    });
  };

  const decline = (memberId) => {
    setSubmittingState(true);
    api(`/api/workspace/team/decline`, {
      body: { memberId },
      method: 'PUT',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toast.success('Declined invitation!');
      }
    });
  };

  const handleNameChange = (event) => setName(event.target.value);

  const navigate = (workspace) => {
    setWorkspace(workspace);
    // router.replace(`/account/${workspace.slug}`);
  };

  const toggleModal = () => setModalState(!showModal);

  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - Dashboard" />
      <Modal
        show={showModal}
        title="Create a Student Record"
        toggle={toggleModal}
      >
        <div className="space-y-0 text-sm text-gray-600">
          <p>
            Create a student entry to keep your student's records in one place.
          </p>
          <p>You&apos;ll be able to invite teachers and tutors later!</p>
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Student Name</h3>
          <p className="text-sm text-gray-400">
            What's your student's name? Nicknames will do.
          </p>
          <input
            className="w-full px-3 py-2 border rounded"
            disabled={isSubmitting}
            onChange={handleNameChange}
            placeholder="Name or Nickname"
            type="text"
            value={name}
          />
        </div>
        <div className="flex flex-col items-stretch">
          <Button
            className="text-white bg-primary-600 hover:bg-primary-600"
            disabled={!validName || isSubmitting}
            onClick={createWorkspace}
          >
            <span>Create Record</span>
          </Button>
        </div>
      </Modal>
      <Content.Title
        title="Living Pupil Homeschool Dashboard"
        subtitle="Enroll your child's future with us"
      />
      <Content.Divider />
      <Content.Container>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 tourDashboard">
          {isFetchingWorkspaces ? (
            <Card>
              <Card.Body />
              <Card.Footer />
            </Card>
          ) : workspacesData?.workspaces.length > 0 ? (
            workspacesData.workspaces.map((workspace, index) => (
              <Card key={index}>
                <Card.Body title={workspace.name}>
                  {!workspace.studentRecord ? (
                    <div className="flex items-center px-2 py-1 space-x-3 text-sm border-2 rounded-full text-amber-500 border-amber-600 bg-amber-50">
                      <div className="w-5 h-5">
                        <ExclamationIcon />
                      </div>
                      <p>Unenrolled student</p>
                    </div>
                  ) : (
                    <div className="flex items-center px-2 py-1 space-x-3 text-sm text-green-500 border-2 border-green-600 rounded-full bg-green-50">
                      <div className="w-5 h-5">
                        <BadgeCheckIcon />
                      </div>
                      <p>Student enrolled</p>
                    </div>
                  )}
                </Card.Body>
                <Card.Footer>
                  <button
                    className="text-primary-600"
                    onClick={() => navigate(workspace)}
                  >
                    {workspace.studentRecord
                      ? 'View record '
                      : 'Create record '}{' '}
                    &rarr;
                  </button>
                </Card.Footer>
              </Card>
            ))
          ) : (
            <Card.Empty>
              <div className="mb-3">Start creating a student record</div>
              <button
                className="hidden px-3 py-2 space-x-3 rounded bg-secondary-500 hover:bg-secondary-400"
                onClick={toggleModal}
              >
                <PlusIcon className="w-5 h-5" aria-hidden="true" />
                <span>Create a Student Record</span>
              </button>
            </Card.Empty>
          )}
        </div>
      </Content.Container>
      <Content.Divider thick />
      <Content.Title
        title="Student Record Invitations"
        subtitle="These are the invitations received by your account"
      />
      <Content.Divider />
      <Content.Container>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {isFetchingInvitations ? (
            <Card>
              <Card.Body />
              <Card.Footer />
            </Card>
          ) : invitationsData?.invitations.length > 0 ? (
            invitationsData.invitations.map((invitation, index) => (
              <Card key={index}>
                <Card.Body
                  title={invitation.workspace.name}
                  subtitle={`You have been invited by ${
                    invitation.invitedBy.name || invitation.invitedBy.email
                  }`}
                />
                <Card.Footer>
                  <Button
                    className="text-white bg-primary-600 hover:bg-primary-600"
                    disabled={isSubmitting}
                    onClick={() => accept(invitation.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    className="text-red-600 border border-red-600 hover:bg-red-600 hover:text-white"
                    disabled={isSubmitting}
                    onClick={() => decline(invitation.id)}
                  >
                    Decline
                  </Button>
                </Card.Footer>
              </Card>
            ))
          ) : (
            <Card.Empty>
              You haven't received any invitations to any student record
            </Card.Empty>
          )}
        </div>
      </Content.Container>
    </AccountLayout>
  );
};

export default Welcome;
