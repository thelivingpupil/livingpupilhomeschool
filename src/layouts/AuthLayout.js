import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Toaster } from 'react-hot-toast';

const AuthLayout = ({ children }) => {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');

    if (status === 'authenticated') {
      let path = '/account';

      if (data.user.studentRecords === 0) {
        path = `${path}/enrollment`;
      }

      router.push(path);
    }
  }, [status, router]);

  return status === 'loading' ? (
    <></>
  ) : (
    <main className="relative flex flex-col items-center justify-center h-screen p-10 space-y-10">
      <Toaster position="bottom-center" toastOptions={{ duration: 10000 }} />
      {children}
    </main>
  );
};

export default AuthLayout;
