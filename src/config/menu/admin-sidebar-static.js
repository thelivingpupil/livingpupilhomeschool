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
  InboxIcon,
  DocumentIcon
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
        showDefault: true,
      },
      {
        name: 'Inquiries',
        icon: QuestionMarkCircleIcon,
        path: `/account/admin/inquiries`,
        showDefault: true,
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
        showDefault: true,
      },
      {
        name: 'Students',
        icon: AcademicCapIcon,
        path: `/account/admin/students`,
        showDefault: true,
      },
      {
        name: 'Shop',
        icon: ShoppingCartIcon,
        path: `/account/admin/shop`,
        showDefault: true,
      },
      {
        name: 'Enrollment',
        icon: CreditCardIcon,
        path: `/account/admin/transactions`,
        showDefault: true,
      },
      {
        name: 'Broadcast',
        icon: InboxIcon,
        path: `/account/admin/broadcast`,
        showDefault: true,
      },
      {
        name: 'Document Request',
        icon: DocumentIcon,
        path: `/account/admin/document-request`,
        showDefault: true,
      },
      {
        name: 'Parent Training',
        icon: UsersIcon,
        path: `/account/admin/parent-training`,
        showDefault: true,
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
        showDefault: true,
      },
      {
        name: 'CMS',
        icon: NewspaperIcon,
        isExternal: true,
        path: `https://cms.livingpupilhomeschool.com`,
        showDefault: true,
      },
      {
        name: 'Blog Content',
        icon: PencilIcon,
        isExternal: true,
        path: `https://notion.so`,
        showDefault: true,
      },
      {
        name: 'Publishing',
        icon: PencilIcon,
        isExternal: true,
        path: `https://vixion.pro`,
        showDefault: true,
      },
    ],
  },
];

export default adminSidebarMenu;
