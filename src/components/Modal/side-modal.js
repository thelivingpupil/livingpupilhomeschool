import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';

const SideModal = ({ children, show, title, toggle }) => {
  return (
    <Transition appear as={Fragment} show={show}>
      <Dialog
        className="fixed inset-0 z-50 overflow-y-auto text-gray-800"
        onClose={toggle}
      >
        <div className="flex items-center justify-center h-screen p-5">
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
          <span aria-hidden="true" className="inline-block align-middle">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-x-10"
            enterTo="opacity-100 translate-x-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-x-0"
            leaveTo="opacity-0 translate-x-10"
          >
            <div className="fixed top-0 bottom-0 right-0 inline-block w-2/3 p-10 space-y-5 overflow-scroll text-left align-middle transition-all transform bg-white shadow-xl md:w-1/3">
              <Dialog.Title
                as="h2"
                className="text-2xl font-bold leading-5 capitalize"
              >
                {title}
              </Dialog.Title>
              {children}
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

SideModal.defaultProps = {
  show: false,
  subtitle: '',
  title: '',
  toggle: null,
};

export default SideModal;
