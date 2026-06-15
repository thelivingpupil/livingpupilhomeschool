import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';

const AgreementScrollModal = ({
  show,
  title,
  onClose,
  onAcknowledge,
  acknowledgeLabel = 'I have read and understand',
  children,
}) => {
  const scrollRef = useRef(null);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);

  useEffect(() => {
    if (!show) {
      setScrolledToEnd(false);
      return;
    }

    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      setScrolledToEnd(
        el.scrollHeight <= el.clientHeight + 1 ||
          el.scrollTop + el.clientHeight >= el.scrollHeight - 24,
      );
    };

    checkScroll();
    const timeout = setTimeout(checkScroll, 100);
    return () => clearTimeout(timeout);
  }, [show, children]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
      setScrolledToEnd(true);
    }
  };

  return (
    <Transition appear as={Fragment} show={show}>
      <Dialog className="fixed inset-0 z-50 text-gray-800" onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen p-4">
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
            <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
              <div className="flex items-start justify-between px-6 pt-6 pb-3 border-b">
                <Dialog.Title as="h2" className="pr-8 text-xl font-bold">
                  {title}
                </Dialog.Title>
                <button
                  type="button"
                  className="outline-none"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 px-6 py-4 overflow-y-auto"
              >
                {children}
              </div>
              <div className="px-6 py-4 space-y-3 border-t bg-gray-50">
                {!scrolledToEnd && (
                  <p className="text-sm text-amber-700">
                    Please scroll to the bottom to continue.
                  </p>
                )}
                <button
                  type="button"
                  disabled={!scrolledToEnd}
                  onClick={onAcknowledge}
                  className="w-full px-4 py-2 text-white rounded bg-secondary-500 hover:bg-secondary-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {acknowledgeLabel}
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AgreementScrollModal;
