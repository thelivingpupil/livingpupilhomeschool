import { useEffect, useState } from 'react';
import Joyride, { EVENTS } from 'react-joyride';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import useSWR from 'swr';

import Content from '@/components/Content/index';
import Header from '@/components/Header/index';
import Sidebar from '@/components/Sidebar/index';
import menu from '@/config/menu/index';
import { useWorkspace } from '@/providers/workspace';
import { XIcon } from '@heroicons/react/outline';
import { ChatAltIcon, InformationCircleIcon } from '@heroicons/react/solid';
import Link from 'next/link';
import Script from 'next/script';
import WorkspaceNotFound from '@/components/WorkspaceNotFound';

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
  const { workspace, setWorkspace } = useWorkspace();
  const [showJourney, setJourneyVisibility] = useState(true);
  const [showHelp, setHelpVisibility] = useState(false);
  const [showModal, setModalVisibility] = useState(false);

  // Check if we're on a workspace route (has [workspaceSlug] in the path)
  const isWorkspaceRoute = router.route?.includes('[workspaceSlug]') || router.pathname?.includes('/account/') && router.pathname !== '/account/enrollment';

  // Extract workspaceSlug from route - wait for router to be ready
  const workspaceSlug = router.isReady ? router.query.workspaceSlug : null;

  // Fetch workspace if not available and we have a workspaceSlug
  const shouldFetchWorkspace = !workspace && workspaceSlug && status === 'authenticated' && router.isReady;
  const { data: workspaceData, error: workspaceError, isLoading: isLoadingWorkspace } = useSWR(
    shouldFetchWorkspace ? `/api/workspace/${workspaceSlug}` : null
  );

  // Set workspace when data is fetched
  useEffect(() => {
    if (workspaceData?.data?.workspace && !workspace) {
      setWorkspace(workspaceData.data.workspace);
    }
  }, [workspaceData, workspace, setWorkspace]);

  // Clear workspace when navigating to a route without workspaceSlug
  useEffect(() => {
    if (router.isReady && !workspaceSlug && workspace) {
      // We're on a route without workspaceSlug (like /account), clear the workspace
      setWorkspace(null);
    }
  }, [router.isReady, workspaceSlug, workspace, setWorkspace]);

  // Determine if we should show workspace menu (only on workspace routes with a valid workspace)
  // Only show if we have a workspaceSlug in the route AND a matching workspace
  const shouldShowWorkspaceMenu = workspaceSlug &&
    workspace?.slug === workspaceSlug &&
    router.pathname !== '/account' &&
    router.pathname !== '/account/enrollment';

  // Show loading state while fetching workspace on direct access
  // Show loading if: we're on a workspace route, workspace is not loaded, and either fetching or waiting for router
  // BUT don't show loading if there's an error (let error page show instead)
  const isWaitingForWorkspace = isWorkspaceRoute && !workspace && status === 'authenticated' && !workspaceError && (isLoadingWorkspace || !router.isReady || shouldFetchWorkspace);

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
      // Preserve the current URL as callbackUrl for redirect after login
      const callbackUrl = encodeURIComponent(router.asPath);
      router.replace(`/auth/login?callbackUrl=${callbackUrl}`);
    } else {
      const hasJourneyed = localStorage.getItem(HAS_JOURNEYED);

      if (hasJourneyed) {
        setJourneyVisibility(false);
      }
    }
  }, [status, router]);

  // Show workspace not found page for 404 errors (check BEFORE loading state)
  if (workspaceError && !workspace && !isLoadingWorkspace) {
    // Check for 404 status or "not found" in error message
    // SWR error might have status directly or in response
    const errorStatus = workspaceError.status || workspaceError?.response?.status;
    const errorMessage = workspaceError?.message || workspaceError?.data?.errors?.error?.msg || '';
    const errorString = JSON.stringify(workspaceError).toLowerCase();
    const isNotFound =
      errorStatus === 404 ||
      errorMessage.toLowerCase().includes('not found') ||
      errorString.includes('not found') ||
      errorString.includes('404');

    if (isNotFound) {
      return <WorkspaceNotFound workspaceSlug={workspaceSlug} />;
    }

    // Show generic error for other errors (500, network, etc.)
    return (
      <main className="relative flex flex-col items-center justify-center w-screen h-screen text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <p className="text-red-600">Error loading workspace. Please try again.</p>
          <button
            onClick={() => router.push('/account')}
            className="mt-4 px-4 py-2 text-white rounded bg-primary-500 hover:bg-primary-600"
          >
            Go to My Workspaces
          </button>
        </div>
      </main>
    );
  }

  // Show loading state while workspace is being fetched
  if (isWaitingForWorkspace) {
    return (
      <main className="relative flex flex-col items-center justify-center w-screen h-screen text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading workspace...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex flex-col w-screen h-screen space-x-0 text-gray-800 dark:text-gray-200 md:space-x-5 md:flex-row bg-gray-50 dark:bg-gray-800">
      {router.route !== '/account/enrollment' && (
        <Sidebar menu={shouldShowWorkspaceMenu ? menu(workspace.slug) : []} showModal={showModal} />
      )}
      <Content route={router.route}>
        <Toaster position="bottom-left" toastOptions={{ duration: 10000 }} />
        <Header menu={shouldShowWorkspaceMenu ? menu(workspace.slug) : []} />
        {children}
        <Script strategy="lazyOnload">
          {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1339259923286669'); 
          fbq('track', 'PageView');
      `}
        </Script>
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
