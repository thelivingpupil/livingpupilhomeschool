import { useEffect, useState } from 'react';
import Joyride, { EVENTS } from 'react-joyride';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

import Content from '@/components/Content/index';
import Header from '@/components/Header/index';
import Sidebar from '@/components/Sidebar/index';
import menu from '@/config/menu/index';
import { useWorkspace } from '@/providers/workspace';
import { XIcon } from '@heroicons/react/outline';
import { ChatAltIcon, InformationCircleIcon } from '@heroicons/react/solid';
import Link from 'next/link';

const HAS_JOURNEYED = 'has-journeyed';
const steps = [
  {
    disableBeacon: true,
    target: '.tourLogo',
    content: (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-center text-primary-500">
          Welcome to the Parent Portal
        </h3>
        <h2 className="text-lg font-bold text-center">
          Let's begin your{' '}
          <span className="text-primary-500">Living Pupil Homeschool</span>{' '}
          journey!
        </h2>
      </div>
    ),
  },
  {
    target: '.tourGuardian',
    content: (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-center text-primary-500">
          An active Guardian Information is required...
        </h3>
        <h2 className="text-lg font-bold text-center">Guardian Information</h2>
        <p className="text-gray-600">
          Prior to enrollment, a student should have a Guardian Information with
          an active contact information and current details that we can reach.
        </p>
      </div>
    ),
  },
  {
    target: '.tourCreate',
    content: (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-center text-primary-500">
          Creating a student record is as easy as 1, 2, 3...
        </h3>
        <h2 className="text-lg font-bold text-center">
          Create a Student Record
        </h2>
        <p className="text-gray-600">
          To start the enrollment process, a student record is required to house
          all records and activities done by the student.
        </p>
      </div>
    ),
  },
  {
    target: '.tourSelect',
    content: (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-center text-primary-500">
          Selecting to view a student record...
        </h3>
        <h2 className="text-lg font-bold text-center">
          Select a Student Record
        </h2>
        <p className="text-gray-600">
          To view a student's records and activities, you may select it from
          here, or...
        </p>
      </div>
    ),
  },
  {
    target: '.tourDashboard',
    content: (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-center text-primary-500">
          Selecting a student record to view...
        </h3>
        <h2 className="text-lg font-bold text-center">
          Select a Student Record
        </h2>
        <p className="text-gray-600">
          ... alternatively, you may select from one of the items above once a
          record has been created.
        </p>
      </div>
    ),
  },
];

const AccountLayout = ({ children }) => {
  const { data, status } = useSession();
  const router = useRouter();
  const { workspace } = useWorkspace();
  const [showJourney, setJourneyVisibility] = useState(true);
  const [showHelp, setHelpVisibility] = useState(false);
  const [showModal, setModalVisibility] = useState(false);

  const handleCallback = (data) => {
    const { type } = data;

    if (type === EVENTS.TOUR_END) {
      localStorage.setItem(HAS_JOURNEYED, true);
      setJourneyVisibility(false);
      setModalVisibility(true);
    }
  };

  const toggleHelp = () => setHelpVisibility(!showHelp);

  const runTour = () => {
    setJourneyVisibility(true);
    toggleHelp();
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/login');
    } else {
      const hasJourneyed = localStorage.getItem(HAS_JOURNEYED);

      if (hasJourneyed) {
        setJourneyVisibility(false);
      }
    }
  }, [status, router]);

  return (
    <main className="relative flex flex-col w-screen h-screen space-x-0 text-gray-800 dark:text-gray-200 md:space-x-5 md:flex-row bg-gray-50 dark:bg-gray-800">
      {router.route !== '/account/enrollment' && (
        <Sidebar menu={menu(workspace?.slug)} showModal={showModal} />
      )}
      <Content route={router.route}>
        <Toaster position="bottom-left" toastOptions={{ duration: 10000 }} />
        <Header />
        {children}
        {showJourney && data && (
          <div>
            <Joyride
              callback={handleCallback}
              continuous
              run={showJourney && data}
              steps={steps}
            />
          </div>
        )}
        <div className="absolute flex flex-col items-end space-y-3 justify-right bottom-5 right-5">
          {showHelp && (
            <div className="flex flex-col p-5 space-y-3 overflow-y-scroll bg-white border border-gray-600 rounded-lg shadow-xl w-80 h-96">
              <button
                className="absolute flex items-center justify-center w-8 h-8 bg-black rounded-full -top-4 -left-4"
                onClick={toggleHelp}
              >
                <XIcon className="w-5 h-5 text-white" />
              </button>
              <h2 className="text-xl font-medium">
                User Guide and Help Section
              </h2>
              <hr />
              {router.route !== '/account/enrollment' && (
                <button
                  className="flex items-center justify-center p-3 space-x-3 text-left text-gray-800 rounded hover:bg-gray-100"
                  onClick={runTour}
                >
                  <InformationCircleIcon className="w-1/6 text-gray-600" />
                  <div className="w-5/6">
                    <h3 className="font-medium">Application Walkthrough</h3>
                    <p className="text-xs text-gray-400">
                      Let us walk you through the Parent Portal application
                    </p>
                  </div>
                </button>
              )}
              <Link href="https://m.me/livingpupilhomeschool">
                <a
                  className="flex items-center justify-center p-3 space-x-3 text-gray-800 rounded hover:bg-gray-100"
                  target="_blank"
                >
                  <ChatAltIcon className="w-1/6 text-gray-600" />
                  <div className="w-5/6">
                    <h3 className="font-medium">Got questions?</h3>
                    <p className="text-xs text-gray-400">
                      Connect with us through Messenger
                    </p>
                  </div>
                </a>
              </Link>
            </div>
          )}
          <button
            className="px-5 py-3 text-sm bg-white border border-gray-600 rounded-full shadow-xl hover:bg-gray-100"
            onClick={toggleHelp}
          >
            Need Help?
          </button>
        </div>
      </Content>
    </main>
  );
};

export default AccountLayout;
