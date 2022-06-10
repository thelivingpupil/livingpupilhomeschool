import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { UserType } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

import Content from '@/components/Content/index';
import Header from '@/components/Header/index';
import AdminSidebar from '@/components/Sidebar/admin';

const AdminLayout = ({ children }) => {
  const { data } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!data && data?.user.userType !== UserType.ADMIN) {
      router.replace('/account');
    }
  }, [data, router]);

  return (
    <main className="relative flex flex-col w-screen h-screen space-x-0 text-gray-800 dark:text-gray-200 md:space-x-5 md:flex-row bg-gray-50 dark:bg-gray-800">
      <AdminSidebar />
      <Content>
        <Toaster position="bottom-left" toastOptions={{ duration: 10000 }} />
        <Header />
        {children}
      </Content>
    </main>
  );
};

export default AdminLayout;
