import Image from 'next/image';
import Link from 'next/link';
import {
  FaFacebookF,
  FaYoutube,
  FaInstagram,
  FaTwitter,
  FaGlobe,
} from 'react-icons/fa';

const icons = {
  facebook: FaFacebookF,
  youtube: FaYoutube,
  instagram: FaInstagram,
  twitter: FaTwitter,
  custom: FaGlobe,
};

const Footer = ({
  description,
  socialLinks,
  about,
  community,
  programs,
  support,
}) => {
  return (
    <footer className="bg-primary-500">
      <div className="container flex flex-col flex-wrap px-5 py-24 mx-auto text-white md:items-center lg:items-start md:flex-row md:flex-nowrap">
        <div className="flex mx-auto space-x-5 md:mx-0 md:text-left md:w-1/3">
          <div className="flex items-center justify-center py-5 font-medium bg-white rounded title-font md:justify-start">
            <Image
              alt="Living Pupil Homeschool"
              src="/images/livingpupil-homeschool-logo.png"
              width={550}
              height={550}
            />
          </div>
          <div className="space-y-5">
            <p className="mt-2 text-sm ">{description}</p>
            <div className="flex space-x-5">
              {socialLinks &&
                socialLinks.map((link, index) => {
                  const Icon = icons[link.icon];
                  return (
                    <Link key={index} href={link.path}>
                      <a
                        className="p-1 bg-white rounded text-primary-500"
                        target={link.isExternal ? '_blank' : undefined}
                        title={link.name}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap flex-grow mt-10 -mb-10 text-center md:pl-20 md:mt-0 md:text-left md:w-2/3">
          <div className="w-full px-4 md:w-1/2">
            <h2 className="mb-3 text-sm font-bold tracking-widest title-font text-secondary-500">
              About Us
            </h2>
            <nav className="mb-10 space-y-5 list-none">
              {about &&
                about.map((link, index) => (
                  <li key={index}>
                    <Link href={link.path}>
                      <a target={link.isExternal ? '_blank' : undefined}>
                        {link.name}
                      </a>
                    </Link>
                  </li>
                ))}
            </nav>
          </div>
          {/* <div className="w-full px-4 lg:w-1/4 md:w-1/2">
            <h2 className="mb-3 text-sm font-bold tracking-widest title-font">
              COMMUNITY
            </h2>
            <nav className="mb-10 list-none">
              {community &&
                community.map((link, index) => (
                  <li key={index}>
                    <Link href={link.path}>
                      <a target={link.isExternal ? '_blank' : undefined}>
                        {link.name}
                      </a>
                    </Link>
                  </li>
                ))}
            </nav>
          </div> */}
          {/* <div className="w-full px-4 lg:w-1/4 md:w-1/2">
            <h2 className="mb-3 text-sm font-bold tracking-widest title-font">
              PROGRAMS
            </h2>
            <nav className="mb-10 list-none">
              {programs &&
                programs.map((link, index) => (
                  <li key={index}>
                    <Link href={link.path}>
                      <a target={link.isExternal ? '_blank' : undefined}>
                        {link.name}
                      </a>
                    </Link>
                  </li>
                ))}
            </nav>
          </div> */}
          <div className="w-full px-4 md:w-1/3">
            <h2 className="mb-3 text-sm font-bold tracking-widest title-font text-secondary-500">
              Support
            </h2>
            <nav className="mb-10 space-y-5 list-none">
              {support &&
                support.map((link, index) => (
                  <li key={index}>
                    <Link href={link.path}>
                      <a target={link.isExternal ? '_blank' : undefined}>
                        {link.name}
                      </a>
                    </Link>
                  </li>
                ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="bg-secondary-500">
        <div className="container px-5 py-4 mx-auto">
          <p className="text-sm text-center">
            © {new Date().getFullYear()} Living Pupil Homeschool. All Rights
            Reserved
          </p>
          {/* <span className="inline-flex justify-center mt-2 space-x-5 sm:ml-auto sm:mt-0 sm:justify-start">
            {socialLinks &&
              socialLinks.map((link, index) => {
                const Icon = icons[link.icon];
                return (
                  <Link key={index} href={link.path}>
                    <a
                      className="text-gray-600"
                      target={link.isExternal ? '_blank' : undefined}
                      title={link.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  </Link>
                );
              })}
          </span> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
