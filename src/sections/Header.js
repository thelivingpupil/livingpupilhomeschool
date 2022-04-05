import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="fixed z-50 w-full text-gray-600 shadow-xl body-font backdrop-blur-xl bg-white/60">
      <div className="container flex flex-col flex-wrap items-center justify-center p-5 mx-auto md:justify-between md:flex-row">
        <a className="flex items-center mb-4 font-medium text-primary-800 title-font md:mb-0">
          <Image
            alt="The Living Pupil Homeschool"
            src="/images/livingpupil-homeschool-icon.png"
            width={65}
            height={65}
          />
          <span className="ml-3 text-xl font-bold md:text-2xl text-primary-600">
            The Living Pupil Homeschool
          </span>
        </a>
        <div className="flex flex-wrap items-center justify-center space-x-0 space-y-5 md:space-x-10 md:space-y-0">
          <nav className="flex flex-wrap items-center justify-center space-x-10 text-base text-gray-800 md:ml-auto">
            <a className="border-b-4 hover:text-primary-600 hover:border-b-primary-600 border-b-transparent">
              About
            </a>
            <a className="border-b-4 hover:text-primary-600 hover:border-b-primary-600 border-b-transparent">
              Programs
            </a>
            <a className="border-b-4 hover:text-primary-600 hover:border-b-primary-600 border-b-transparent">
              Curriculum
            </a>
          </nav>
          <Link href="/auth/login">
            <a className="inline-flex items-center px-10 py-3 text-base font-bold border-0 rounded-full text-primary-800 bg-secondary-500 focus:outline-none hover:bg-primary-600 hover:text-white">
              Parent Portal &rarr;
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
