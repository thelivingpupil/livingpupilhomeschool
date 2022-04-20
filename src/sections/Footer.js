import Image from 'next/image';
import Link from 'next/link';
import { FaFacebookF, FaYoutube, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer>
      <div className="container flex flex-col flex-wrap px-5 py-24 mx-auto md:items-center lg:items-start md:flex-row md:flex-nowrap">
        <div className="flex-shrink-0 w-64 mx-auto text-center md:mx-0 md:text-left">
          <a className="flex items-center justify-center font-medium title-font md:justify-start">
            <Image
              alt="Living Pupil Homeschool"
              src="/images/LPHS-logo-horizontal.png"
              width={260}
              height={120}
            />
          </a>
          <p className="mt-2 text-sm ">
            Living Pupil Homeschool is a DepEd accredited, open curriculum,
            Charlotte Mason method Homeschool provider based in Cebu City but
            operating nationwide and internationally.
          </p>
        </div>
        <div className="flex flex-wrap flex-grow mt-10 -mb-10 text-center md:pl-20 md:mt-0 md:text-left">
          <div className="w-full px-4 lg:w-1/4 md:w-1/2">
            <h2 className="mb-3 text-sm font-bold tracking-widest title-font">
              ABOUT
            </h2>
            <nav className="mb-10 list-none">
              <li>
                <a>Living Pupil Homeschool</a>
              </li>
              <li>
                <a>How It Works</a>
              </li>
              <li>
                <a>The Team</a>
              </li>
              <li>
                <a>Charlotte Mason</a>
              </li>
            </nav>
          </div>
          <div className="w-full px-4 lg:w-1/4 md:w-1/2">
            <h2 className="mb-3 text-sm font-bold tracking-widest title-font">
              COMMUNITY
            </h2>
            <nav className="mb-10 list-none">
              <li>
                <a>Learning Resources</a>
              </li>
              <li>
                <a>News and Announcements</a>
              </li>
              <li>
                <a>Our Blog and Stories</a>
              </li>
              <li>
                <a>Social Channels</a>
              </li>
            </nav>
          </div>
          <div className="w-full px-4 lg:w-1/4 md:w-1/2">
            <h2 className="mb-3 text-sm font-bold tracking-widest title-font">
              PROGRAMS
            </h2>
            <nav className="mb-10 list-none">
              <li>
                <a>Programs</a>
              </li>
              <li>
                <a>Curriculums</a>
              </li>
              <li>
                <a>Enrollment</a>
              </li>
            </nav>
          </div>
          <div className="w-full px-4 lg:w-1/4 md:w-1/2">
            <h2 className="mb-3 text-sm font-bold tracking-widest title-font">
              SUPPORT
            </h2>
            <nav className="mb-10 list-none">
              <li>
                <a>Help Center</a>
              </li>
              <li>
                <a>Contact Us</a>
              </li>
              <li>
                <a>Privacy Policy</a>
              </li>
              <li>
                <a>Terms and Conditions</a>
              </li>
            </nav>
          </div>
        </div>
      </div>
      <div className="bg-gray-100">
        <div className="container flex flex-col flex-wrap px-5 py-4 mx-auto sm:flex-row">
          <p className="text-sm text-center sm:text-left">
            © {new Date().getFullYear()} Living Pupil Homeschool —
            <Link href="https://twitter.com/nextacular">
              <a
                rel="noopener noreferrer"
                className="ml-1 text-gray-600"
                target="_blank"
              >
                @nextacular
              </a>
            </Link>
          </p>
          <span className="inline-flex justify-center mt-2 sm:ml-auto sm:mt-0 sm:justify-start">
            <a className="text-gray-600">
              <FaFacebookF className="w-5 h-5" />
            </a>
            <a className="ml-3 text-gray-600">
              <FaYoutube className="w-5 h-5" />
            </a>
            <a className="ml-3 text-gray-600">
              <FaInstagram className="w-5 h-5" />
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
