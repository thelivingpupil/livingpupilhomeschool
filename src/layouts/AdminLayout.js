import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { UserType } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

import Content from '@/components/Content/index';
import Header from '@/components/Header/index';
import AdminSidebar from '@/components/Sidebar/admin';

const AdminLayout = ({ children }) => {
  const { data, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && data?.user.userType !== UserType.ADMIN) {
      router.replace('/account');
    }
  }, [data, router, status]);

  return (
    <main className="relative flex flex-col w-screen h-screen space-x-0 text-gray-800 dark:text-gray-200 md:space-x-5 md:flex-row bg-gray-50 dark:bg-gray-800">
      <AdminSidebar />
      <Content admin>
        <Toaster position="bottom-left" toastOptions={{ duration: 10000 }} />
        <Header />
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
      </Content>
    </main>
  );
};

export default AdminLayout;
