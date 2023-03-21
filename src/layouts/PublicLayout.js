import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

const PublicLayout = ({ children }) => {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');
  }, []);

  return (
    <main className="relative flex flex-col items-center justify-center h-screen space-y-10 text-gray-800 bg-gray-50">
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

export default PublicLayout;
