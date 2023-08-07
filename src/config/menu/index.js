const menu = (workspaceId) => [
  {
    name: 'Student Record',
    menuItems: [
      {
        name: 'Profile',
        path: `/account/${workspaceId}`,
        showDefault: true,
      },
      {
        name: 'Grades',
        path: `/account/${workspaceId}/grades`,
        showDefault: false,
        validateItem: (validate) => {
          return validate;
        },
      },
      {
        name: 'Courses and Training',
        path: `/account/${workspaceId}/training`,
        showDefault: false,
        validateItem: (validate) => {
          return validate;
        },
      },
      {
        name: 'School Fees',
        path: `/account/${workspaceId}/fees`,
        showDefault: true,
      },
    ],
  },
  {
    name: 'Settings',
    menuItems: [
      {
        name: 'Student Information',
        path: `/account/${workspaceId}/settings/general`,
        showDefault: true,
      },
      {
        name: 'Group Members',
        path: `/account/${workspaceId}/settings/team`,
        showDefault: true,
      },
      {
        name: 'Advanced',
        path: `/account/${workspaceId}/settings/advanced`,
        showDefault: true,
      },
    ],
  },
];

export default menu;
