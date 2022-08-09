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
