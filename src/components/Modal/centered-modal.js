import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';

const CenteredModal = ({ children, show, title, toggle }) => {
  return (
    <Transition appear as={Fragment} show={show}>
      <Dialog
        className="fixed inset-0 z-50 overflow-y-auto text-gray-800"
        onClose={toggle}
      >
        <div className="flex items-center justify-center min-h-full p-5">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="relative z-10 inline-block w-2/3 max-h-[90vh] p-10 space-y-5 overflow-hidden text-left align-middle transition-all bg-white shadow-xl md:w-1/3">
              <Dialog.Title
                as="h2"
                className="text-2xl font-bold leading-5 capitalize"
              >
                {title}
              </Dialog.Title>
              <div className="overflow-y-auto max-h-[calc(90vh-8rem)] pr-1">
                {children}
              </div>
              <button
                className="absolute top-0 outline-none right-5"
                onClick={toggle}
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

CenteredModal.defaultProps = {
  show: false,
  title: '',
  toggle: null,
};

export default CenteredModal;
