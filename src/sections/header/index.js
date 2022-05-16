import { useState } from 'react';
import { MenuIcon } from '@heroicons/react/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Header = ({ cta, menuLinks }) => {
  const router = useRouter();
  const [showMenu, setMenuVisibility] = useState(false);

  const toggleMenu = () => setMenuVisibility(!showMenu);

  return (
    <header className="z-50 px-5 py-5 md:px-0">
      <div className="container flex items-center justify-between px-2 mx-auto md:px-10">
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
          <button className="md:hidden" onClick={toggleMenu}>
            <MenuIcon className="w-8 h-8" />
          </button>
          <nav
            className={[
              'md:items-center md:justify-center md:flex-row md:flex md:relative md:shadow-none md:top-0',
              showMenu
                ? 'absolute z-50 flex flex-col left-5 right-5 space-x-0 rounded shadow-xl md:py-0 md:left-0 md:right-0 top-24 bg-white'
                : 'hidden',
            ].join(' ')}
          >
            <ul className="flex flex-col p-5 space-x-0 space-y-5 md:space-y-0 md:space-x-5 md:flex-row">
              {menuLinks &&
                menuLinks.map((link, index) => (
                  <li key={index}>
                    <div className="relative group">
                      <Link href={!link.hasChildLinks ? link.path : '#!'}>
                        <a
                          className={`md:group-hover:text-secondary-500 ${
                            router.pathname == link.path
                              ? 'text-secondary-500'
                              : null
                          }`}
                          target={link.isExternal ? '_blank' : undefined}
                        >
                          {link.name}
                        </a>
                      </Link>
                      {link.hasChildLinks && (
                        <div className="p-3 transition-all md:rounded md:shadow-xl md:border md:bg-white md:absolute md:hidden w-80 group-hover:block md:border-gray-50">
                          <ul className="flex flex-col">
                            {link.childLinks.map((link, index) => (
                              <li key={index}>
                                <Link
                                  href={!link.hasChildLinks ? link.path : '/'}
                                >
                                  <a
                                    className="block px-3 py-2 rounded hover:bg-primary-500 hover:text-white"
                                    target={
                                      link.isExternal ? '_blank' : undefined
                                    }
                                  >
                                    {link.name}
                                  </a>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </nav>
          {cta && (
            <Link href={cta.path}>
              <a className="inline-block px-3 py-2 text-xs text-center text-white rounded-lg md:px-5 md:py-3 bg-primary-500 hover:bg-primary-400 md:text-base">
                {cta.name}
              </a>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
