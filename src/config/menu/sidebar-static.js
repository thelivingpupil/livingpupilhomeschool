const sidebarMenu = () => [
  {
    name: 'Account',
    menuItems: [
      {
        name: 'Enrollment Form',
        path: `/account/enrollment`,
      },
      {
        name: 'Dashboard',
        path: `/account`,
      },
      {
        className: 'tourGuardian',
        name: 'Guardian Information',
        path: `/account/information`,
      },
      {
        name: 'Shop Purchases',
        path: `/account/purchase-history`,
      },
      {
        name: 'Calendar of Events',
        path: `/account/calendar`,
      },
      {
        name: 'Guides and Resources',
        path: `/account/resources`,
      },
      {
        name: 'The LP Community',
        path: `/account/community`,
      },
      {
        name: 'Affiliate Link',
        path: `/account/affiliate`,
      },
      {
        name: 'Settings',
        path: `/account/settings`,
      },
    ],
  },
];

export default sidebarMenu;
