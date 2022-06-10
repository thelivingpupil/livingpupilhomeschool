import { useState } from 'react';
import Link from 'next/link';

import Menu from './menu';
import adminSidebarMenu from '@/config/menu/admin-sidebar-static';
import { MenuIcon } from '@heroicons/react/outline';

const staticMenu = adminSidebarMenu();

const AdminSidebar = () => {
  const [showMenu, setMenuVisibility] = useState(false);

  const renderStaticMenu = () => {
    return staticMenu.map((item, index) => (
      <Menu key={index} data={item} showMenu={true} />
    ));
  };

  const toggleMenu = () => setMenuVisibility(!showMenu);

  return (
    <aside className="sticky z-40 flex flex-col space-y-5 text-white bg-primary-500 dark:bg-primary-700 md:overflow-y-auto md:w-1/5 md:h-screen overscroll-contain">
      <div className="relative flex items-center justify-center p-5 text-center border-b border-b-gray-900">
        <Link href="/">
          <a className="flex-grow text-lg font-bold">Living Pupil Homeschool</a>
        </Link>
        <button className="absolute right-0 p-5 md:hidden" onClick={toggleMenu}>
          <MenuIcon className="w-6 h-6" />
        </button>
      </div>
      <div
        className={[
          'flex-col space-y-5 md:flex md:relative md:top-0',
          showMenu
            ? 'absolute top-12 bg-gray-800 right-0 left-0 h-screen'
            : 'hidden',
        ].join(' ')}
      >
        <div className="flex flex-col p-5 space-y-10">{renderStaticMenu()}</div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
