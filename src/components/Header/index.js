import { Fragment, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  CogIcon,
  DesktopComputerIcon,
  IdentificationIcon,
  LogoutIcon,
  MoonIcon,
  ShoppingCartIcon,
  SunIcon,
  UserCircleIcon,
} from '@heroicons/react/outline';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { UserType } from '@prisma/client';
import { useRouter } from 'next/router';
import Actions from './actions';
import Menus from './menus';
import { useWorkspaces } from '@/hooks/data';
import { useWorkspace } from '@/providers/workspace';
import { TransactionStatus } from '@prisma/client';

const Header = ({ menu }) => {
  const router = useRouter();
  const { data } = useSession();
  // const { theme, setTheme } = useTheme();

  const logOut = () => {
    const result = confirm('Are you sure you want to logout?');

    if (result) {
      signOut({ callbackUrl: '/' });
    }
  };

  // const toggleTheme = (event) => {
  //   event.preventDefault();
  //   setTheme(theme === 'dark' ? 'light' : 'dark');
  // };

  const [showMenu, setMenuVisibility] = useState(false);
  const { studentData, isLoading } = useWorkspaces();
  const { workspace } = useWorkspace();

  const [selectedItem, setSelectedItem] = useState(null); // Define selectedItem

  const renderMenu = () => {
    return (
      workspace &&
      menu?.map((item, index) => (
        <Menus
          key={index}
          data={item}
          isLoading={isLoading}
          menuCondition={!!workspace?.studentRecord}
          showMenu={true}
          validate={
            workspace?.schoolFees?.length > 0 &&
            workspace?.schoolFees?.filter(
              (fee) => fee.transaction.paymentStatus === TransactionStatus.S
            )?.length > 0
          }
          workspace={workspace}
        />
      ))
    );
  };

  return (
    <div>
      <div className="flex flex-row items-center justify-between">
        <div>
          <h5 className="font-bold text-gray-800 dark:text-gray-200">
            {data && data.user && (
              <span>{data.user.name || data.user.email}</span>
            )}
          </h5>
        </div>
        <Menu as="div" className="relative z-30 inline-block text-left">
          <div>
            <Menu.Button className="flex items-center justify-center px-5 py-2 space-x-3 border rounded hover:bg-gray-100 dark:hover:text-gray-800">
              <CogIcon aria-hidden="true" className="w-5 h-5" />
              <span>Settings</span>
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 w-40 mt-2 origin-top-right bg-white border divide-y divide-gray-100 rounded">
              <div className="p-2">
                <Menu.Item>
                  <Link href="/account">
                    <a className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-gray-800 rounded hover:bg-primary-600 hover:text-white group">
                      <DesktopComputerIcon
                        aria-hidden="true"
                        className="w-5 h-5"
                      />
                      <span>Dashboard</span>
                    </a>
                  </Link>
                </Menu.Item>
                <Menu.Item>
                  <Link href="/account/settings">
                    <a className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-gray-800 rounded hover:bg-primary-600 hover:text-white group">
                      <UserCircleIcon aria-hidden="true" className="w-5 h-5" />
                      <span>Account</span>
                    </a>
                  </Link>
                </Menu.Item>
                {/* <Menu.Item>
                  <Link href="/account/billing">
                    <a className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-gray-800 rounded hover:bg-primary-600 hover:text-white group">
                      <CreditCardIcon aria-hidden="true" className="w-5 h-5" />
                      <span>Billing</span>
                    </a>
                  </Link>
                </Menu.Item> */}
              </div>
              <div className="p-2">
                {/* <Menu.Item>
                  <Link href="/">
                    <a className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-gray-800 rounded hover:bg-primary-600 hover:text-white group">
                      <DesktopComputerIcon
                        aria-hidden="true"
                        className="w-5 h-5"
                      />
                      <span>Landing Page</span>
                    </a>
                  </Link>
                </Menu.Item> */}
                <Menu.Item>
                  <Link href="/shop">
                    <a
                      className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-gray-800 rounded hover:bg-primary-600 hover:text-white group"
                      target="_blank"
                    >
                      <ShoppingCartIcon
                        aria-hidden="true"
                        className="w-5 h-5"
                      />
                      <span>Shop</span>
                    </a>
                  </Link>
                </Menu.Item>
                {/* <Menu.Item>
                  <button
                    className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-gray-800 rounded hover:bg-primary-600 hover:text-white group"
                    onClick={toggleTheme}
                  >
                    {theme === 'dark' ? (
                      <>
                        <SunIcon className="w-5 h-5" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <MoonIcon className="w-5 h-5" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </Menu.Item> */}
              </div>
              {data && data.user && data.user.userType === UserType.ADMIN && (
                <div className="p-2">
                  <Menu.Item>
                    <Link
                      href={
                        router.pathname.includes('/account/admin')
                          ? '/account'
                          : '/account/admin'
                      }
                    >
                      <a className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-gray-800 rounded hover:bg-primary-600 hover:text-white group">
                        <IdentificationIcon
                          aria-hidden="true"
                          className="w-5 h-5"
                        />
                        <span>
                          {router.pathname.includes('/account/admin')
                            ? 'Parent Portal'
                            : 'Administration'}
                        </span>
                      </a>
                    </Link>
                  </Menu.Item>
                </div>
              )}
              <div className="p-2">
                <Menu.Item>
                  <button
                    className="flex items-center w-full px-2 py-2 space-x-2 text-sm text-gray-800 rounded hover:bg-primary-600 hover:text-white group"
                    onClick={logOut}
                  >
                    <LogoutIcon aria-hidden="true" className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      <div className="flex flex-col md:flex-row md:flex-wrap md:items-center">
        <Actions />
        {renderMenu()}
      </div>
    </div>
  );
};

export default Header;
