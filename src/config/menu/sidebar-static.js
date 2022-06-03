const sidebarMenu = () => [
  {
    name: 'Account',
    menuItems: [
      {
        name: 'Dashboard',
        path: `/account`,
      },
      {
        name: 'Guardian Information',
        path: `/account/information`,
      },
      // {
      //   name: 'Shop Purchases',
      //   path: `/account/purchase-history`,
      // },
      // {
      //   name: 'Billing',
      //   path: `/account/billing`,
      // },
      {
        name: 'Settings',
        path: `/account/settings`,
      },
    ],
  },
];

export default sidebarMenu;
