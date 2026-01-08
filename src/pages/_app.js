import { useEffect, useState, useMemo } from 'react';
import Router, { useRouter } from 'next/router';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import ReactGA from 'react-ga';
import TopBarProgress from 'react-topbar-progress-indicator';
import { SWRConfig } from 'swr';

import progressBarConfig from '@/config/progress-bar/index';
import swrConfig from '@/config/swr/index';
import WorkspaceProvider from '@/providers/workspace';
import CartProvider from '@/providers/cart';

import Image from 'next/image';
import Link from 'next/link';

import '@/styles/globals.css';
import '@/styles/datepicker.css';
import '@/styles/transactionProgress.css';
import '@splidejs/react-splide/css';

const App = ({ Component, pageProps }) => {
  const [progress, setProgress] = useState(false);
  const [isGAInitialized, setIsGAInitialized] = useState(false);
  const router = useRouter();
  const swrOptions = useMemo(() => swrConfig(), []);

  // Configure progress bar once
  useEffect(() => {
    TopBarProgress.config(progressBarConfig());
  }, []);

  // Set up router event listeners
  useEffect(() => {
    const handleRouteStart = () => setProgress(true);
    const handleRouteComplete = () => setProgress(false);

    Router.events.on('routeChangeStart', handleRouteStart);
    Router.events.on('routeChangeComplete', handleRouteComplete);

    return () => {
      Router.events.off('routeChangeStart', handleRouteStart);
      Router.events.off('routeChangeComplete', handleRouteComplete);
    };
  }, []);

  // Initialize Google Analytics
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      const gaTrackingID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
      if (gaTrackingID) {
        try {
          ReactGA.initialize(gaTrackingID);
          setIsGAInitialized(true);
          // Track initial pageview
          ReactGA.pageview(window.location.pathname + window.location.search);
        } catch (error) {
          console.error('Failed to initialize Google Analytics:', error);
        }
      }
    }
  }, []);

  // Track route changes
  useEffect(() => {
    if (!isGAInitialized) return;

    const handleRouteChange = (url) => {
      try {
        ReactGA.pageview(url);
      } catch (error) {
        console.error('Failed to track pageview:', error);
      }
    };

    Router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [isGAInitialized]);

  return (
    <SessionProvider session={pageProps.session}>
      <SWRConfig value={swrOptions}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
          suppressHydrationWarning
        >
          <WorkspaceProvider>
            <CartProvider>
              <SessionWrapper progress={progress} Component={Component} pageProps={pageProps} />
            </CartProvider>
          </WorkspaceProvider>
        </ThemeProvider>
      </SWRConfig>
    </SessionProvider>
  );
};

const SessionWrapper = ({ progress, Component, pageProps }) => {
  const router = useRouter();
  const { data: session } = useSession();


  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' }); // Redirect to homepage after logout
  };

  return (
    <>
      {progress && <TopBarProgress />}
      {!session?.user?.deletedAt && <Component {...pageProps} />}
      {session?.user?.deletedAt && (
        <div>
          <div className="flex flex-col items-center justify-center p-5 m-auto space-y-5 rounded shadow-lg md:p-10 md:w-1/3">
            <Link href="/">
              <a>
                <Image
                  alt="Living Pupil Homeschool"
                  src="/images/livingpupil-homeschool-logo.png"
                  width={80}
                  height={80}
                />
              </a>
            </Link>
            <Link href="/">
              <a className="text-4xl font-bold text-center text-primary-500">
                Living Pupil Homeschool
              </a>
            </Link>
            <h1>Your account has been deactivated</h1>
            <p>Please contact info@livingpupilhomeschool.com for further assistance.</p>
            {session && (
              <button
                onClick={handleLogout}
                className="py-2 px-4 bg-primary-500 text-white rounded hover:bg-primary-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default App;
