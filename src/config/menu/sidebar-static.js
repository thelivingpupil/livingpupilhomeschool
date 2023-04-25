const sidebarMenu = () => [
  {
    name: 'Account',
    menuItems: [
      // {
      //   name: 'Enrollment Form',
      //   path: `/account/enrollment`,
      //   showDefault: true,
      // },
      {
        name: 'Dashboard',
        path: `/account`,
        showDefault: true,
      },
      {
        className: 'tourGuardian',
        name: 'Guardian Information',
        path: `/account/information`,
        showDefault: false,
      },
      {
        name: 'Shop Purchases',
        path: `/account/purchase-history`,
        showDefault: true,
      },
      {
        name: 'Calendar of Events',
        path: `/account/calendar`,
        showDefault: false,
      },
      {
        name: 'Guides and Resources',
        path: `/account/resources`,
        showDefault: false,
      },
      {
        name: 'The LP Community',
        path: `/account/community`,
        showDefault: false,
      },
      {
        name: 'Affiliate Link',
        path: `/account/affiliate`,
        showDefault: false,
      },
      {
        name: 'Settings',
        path: `/account/settings`,
        showDefault: true,
      },
    ],
  },
];

export default sidebarMenu;
