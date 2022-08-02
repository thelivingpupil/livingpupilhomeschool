import {
  AcademicCapIcon,
  AdjustmentsIcon,
  CashIcon,
  CreditCardIcon,
  HomeIcon,
  NewspaperIcon,
  PencilIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  UsersIcon,
} from '@heroicons/react/outline';
import { QuestionMarkCircleIcon } from '@heroicons/react/solid';

const adminSidebarMenu = () => [
  {
    name: 'Administration',
    menuItems: [
      {
        name: 'Dashboard',
        icon: HomeIcon,
        path: `/account/admin`,
      },
      {
        name: 'Inquiries',
        icon: QuestionMarkCircleIcon,
        path: `/account/admin/inquiries`,
      },
      {
        name: 'Accounts',
        icon: UsersIcon,
        path: `/account/admin/accounts`,
      },
    ],
  },
  {
    name: 'School Management',
    menuItems: [
      {
        name: 'Users',
        icon: UserCircleIcon,
        path: `/account/admin/users`,
      },
      {
        name: 'Students',
        icon: AcademicCapIcon,
        path: `/account/admin/students`,
      },
      {
        name: 'Shop',
        icon: ShoppingCartIcon,
        path: `/account/admin/shop`,
      },
      {
        name: 'Enrollment',
        icon: CreditCardIcon,
        path: `/account/admin/transactions`,
      },
    ],
  },
  {
    name: 'External Links',
    menuItems: [
      {
        name: 'DragonPay',
        icon: CashIcon,
        isExternal: true,
        path: `https://gw.dragonpay.ph`,
      },
      {
        name: 'CMS',
        icon: NewspaperIcon,
        isExternal: true,
        path: `https://cms.livingpupilhomeschool.com`,
      },
      {
        name: 'Blog Content',
        icon: PencilIcon,
        isExternal: true,
        path: `https://notion.so`,
      },
      {
        name: 'Publishing',
        icon: PencilIcon,
        isExternal: true,
        path: `https://vixion.pro`,
      },
    ],
  },
];

export default adminSidebarMenu;
