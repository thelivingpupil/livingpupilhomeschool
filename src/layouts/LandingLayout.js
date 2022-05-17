import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Toaster } from 'react-hot-toast';

const LandingLayout = ({ children }) => {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');
  }, []);

  return (
    <main className="relative flex flex-col text-primary-500">
      <Toaster position="bottom-center" toastOptions={{ duration: 10000 }} />
      {children}
    </main>
  );
};

export default LandingLayout;
