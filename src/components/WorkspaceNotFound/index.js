import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

const WorkspaceNotFound = ({ workspaceSlug }) => {
  const router = useRouter();

  return (
    <main className="relative flex flex-col items-center justify-center w-screen h-screen text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800">
      <div className="flex flex-col items-center justify-center p-10 space-y-6 text-center max-w-md">
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
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or you don't have access to it.
          </p>
          {workspaceSlug && (
            <p className="text-sm text-gray-500 font-mono">
              Workspace: <span className="font-semibold">{workspaceSlug}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col space-y-3 w-full">
          <Link href="/account">
            <a className="px-6 py-3 text-white rounded-md bg-primary-500 hover:bg-primary-600 transition-colors">
              Go to My Workspaces
            </a>
          </Link>
          
          <button
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
          
          <Link href="/">
            <a className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors">
              Go to Home
            </a>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default WorkspaceNotFound;

