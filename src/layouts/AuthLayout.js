import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

const AuthLayout = ({ children }) => {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');

    if (status === 'authenticated') {
      // Check if there's a callbackUrl in query params
      const callbackUrl = router.query.callbackUrl;
      
      if (callbackUrl && typeof callbackUrl === 'string') {
        // Decode and redirect to the original URL
        const decodedUrl = decodeURIComponent(callbackUrl);
        router.push(decodedUrl);
      } else {
        // Default redirect behavior
        let path = '/account';

        if (data.user.studentRecords === 0) {
          path = `${path}/enrollment`;
        }

        router.push(path);
      }
    }
  }, [status, router, data]);

  return (
    <main className="relative flex flex-col items-center justify-center h-screen p-10 space-y-10">
      <Toaster position="bottom-center" toastOptions={{ duration: 10000 }} />
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
    </main>
  );
};

export default AuthLayout;
