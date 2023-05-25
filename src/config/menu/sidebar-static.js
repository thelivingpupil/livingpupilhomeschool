const sidebarMenu = () => [
  {
    name: 'Account',
    menuItems: [
      {
        name: 'Enrollment Form',
        path: `/account/enrollment`,
        showDefault: true,
      },
      {
        name: 'Dashboard',
        path: `/account`,
        showDefault: true,
      },
      {
        className: 'tourGuardian',
        name: 'Guardian Information',
        path: `/account/information`,
        showDefault: true,
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
        validateItem: (validate) => {
          return validate;
        },
      },
      {
        name: 'Guides and Resources',
        path: `/account/resources`,
        showDefault: false,
        validateItem: (validate) => {
          return validate;
        },
      },
      {
        name: 'The LP Community',
        path: `/account/community`,
        showDefault: false,
        validateItem: (validate) => {
          return validate;
        },
      },
      {
        name: 'Affiliate Link',
        path: `/account/affiliate`,
        showDefault: true,
      },
      {
        name: 'Virtual Library',
        path: `/account/library`,
        showDefault: false,
        validateItem: (validate) => {
          return validate;
        },
      },
      {
        name: 'Lesson Plans',
        path: `/account/lesson-plans`,
        showDefault: false,
        validateItem: (validate) => {
          return validate;
        },
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
