import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="py-5">
      <div className="container flex items-center justify-between mx-auto">
        <div className="relative">
          <Link href="/">
            <a>
              <Image
                alt="Living Pupil Homeschool"
                src="/images/LPHS-logo-horizontal.png"
                width={130}
                height={60}
              />
            </a>
          </Link>
        </div>
        <div className="flex items-center justify-center space-x-3">
          <nav>
            <ul className="flex space-x-5">
              <li>
                <Link href="/">
                  <a className="text-center hover:text-secondary-500">
                    About Us
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <a className="text-center hover:text-secondary-500">
                    Programs and Rates
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <a className="text-center hover:text-secondary-500">
                    Charlotte Mason
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <a className="text-center hover:text-secondary-500">
                    Enrollment
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <a className="text-center hover:text-secondary-500">Blog</a>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <a className="text-center hover:text-secondary-500">Shop</a>
                </Link>
              </li>
              <li>
                <Link href="/">
                  <a className="text-center hover:text-secondary-500">
                    Parent Portal
                  </a>
                </Link>
              </li>
            </ul>
          </nav>
          <Link href="/auth/login">
            <a className="inline-block px-5 py-3 text-center text-white rounded-lg bg-primary-500 hover:bg-primary-400">
              Enroll Now
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
