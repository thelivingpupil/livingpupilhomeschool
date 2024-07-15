import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const PopUp = ({ children, show, title, toggle }) => {
    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (show) {
            setShowConfetti(true);
            const timer = setTimeout(() => {
                setShowConfetti(false);
            }, 3880); // 3 seconds
            return () => clearTimeout(timer);
        }
    }, [show]);

    return (
        <Transition appear as={Fragment} show={show}>
            <Dialog
                className="fixed inset-0 z-50 overflow-y-auto"
                onClose={toggle}
            >
                <div className="flex items-center justify-center min-h-screen px-4 text-center">
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
                        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                            {showConfetti && <Confetti width={width} height={height} />}
                            <Dialog.Title
                                as="h2"
                                className="text-lg font-medium leading-6 text-gray-900"
                            >
                                {title}
                            </Dialog.Title>
                            <div className="mt-2 text-sm text-center"> {/* Added text-center class here */}
                                {children}
                            </div>
                            <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button
                                    type="button"
                                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    onClick={toggle}
                                >
                                    <span className="sr-only">Close</span>
                                    <XIcon className="w-6 h-6" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
};

PopUp.defaultProps = {
    show: false,
    title: '',
    toggle: null,
};

export default PopUp;
