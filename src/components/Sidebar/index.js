import { useState } from 'react';
import Link from 'next/link';

import Actions from './actions';
import Menu from './menu';
import sidebarMenu from '@/config/menu/sidebar-static';
import { useWorkspaces } from '@/hooks/data';
import { useWorkspace } from '@/providers/workspace';
import { MenuIcon } from '@heroicons/react/outline';
import { TransactionStatus } from '@prisma/client';

const staticMenu = sidebarMenu();

const Sidebar = ({ menu, showModal }) => {
  const [showMenu, setMenuVisibility] = useState(false);
  const { data, isLoading } = useWorkspaces();
  const { workspace } = useWorkspace();

  const renderMenu = () => {
    return (
      workspace &&
      menu.map((item, index) => (
        <Menu
          key={index}
          data={item}
          isLoading={isLoading}
          menuCondition={
            workspace?.schoolFees?.length > 0 &&
            workspace?.schoolFees?.filter(
              (fee) => fee.transaction.paymentStatus === TransactionStatus.S
            )?.length > 0
          }
          showMenu={data?.workspaces.length > 0 || isLoading}
        />
      ))
    );
  };

  const renderStaticMenu = () => {
    return staticMenu.map((item, index) => (
      <Menu
        key={index}
        data={item}
        menuCondition={data?.workspaces.length > 0}
        showMenu={true}
      />
    ));
  };

  const toggleMenu = () => setMenuVisibility(!showMenu);

  return (
    <aside className="sticky z-40 flex flex-col space-y-5 text-white bg-primary-500 dark:bg-primary-700 md:overflow-y-auto md:w-1/4 md:h-screen overscroll-contain">
      <div className="relative flex items-center justify-center p-5 text-center border-b border-b-gray-900">
        <Link href="/">
          <a className="flex-grow text-2xl font-bold tourLogo">
            Living Pupil Homeschool
          </a>
        </Link>
        <button className="absolute right-0 p-5 md:hidden" onClick={toggleMenu}>
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>
      <div
        className={[
          'flex-col space-y-5 md:flex md:relative md:top-0',
          showMenu
            ? 'absolute top-12 bg-primary-500 right-0 left-0 h-screen py-10'
            : 'hidden',
        ].join(' ')}
      >
        <Actions show={showModal} />
        <div className="flex flex-col p-5 space-y-10">
          {renderStaticMenu()}
          {renderMenu()}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
