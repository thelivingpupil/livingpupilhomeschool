import { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/solid';
import { mutate as mutateSWR } from 'swr';

import Button from '@/components/Button/index';
import CreateStudentModal from '@/components/account/CreateStudentModal';

const Actions = ({ show }) => {
  const [showModal, setModalState] = useState(false);

  const toggleModal = () => setModalState(!showModal);

  const afterStudentCreated = () => {
    mutateSWR('/api/workspaces');
    mutateSWR('/api/account/students');
  };

  useEffect(() => {
    setModalState(show);
  }, [show]);

  return (
    <div className="flex flex-col items-stretch justify-center px-5 space-y-3">
      <Button
        className="text-gray-800 tourCreate bg-secondary-500 hover:bg-secondary-400"
        onClick={toggleModal}
      >
        <PlusIcon className="w-5 h-5" aria-hidden="true" />
        <span>Enroll Student</span>
      </Button>
      <CreateStudentModal
        onCreated={afterStudentCreated}
        show={showModal}
        toggle={toggleModal}
      />
    </div>
  );
};

export default Actions;
