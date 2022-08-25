const menu = (workspaceId) => [
  {
    name: 'Student Record',
    menuItems: [
      {
        name: 'Profile',
        path: `/account/${workspaceId}`,
      },
      {
        name: 'Grades',
        path: `/account/${workspaceId}/grades`,
      },
      {
        name: 'Courses and Training',
        path: `/account/${workspaceId}/training`,
      },
      {
        name: 'School Fees',
        path: `/account/${workspaceId}/fees`,
      },
    ],
  },
  {
    name: 'Settings',
    menuItems: [
      {
        name: 'Student Information',
        path: `/account/${workspaceId}/settings/general`,
      },
      // {
      //   name: 'Domain Configurations',
      //   path: `/account/${workspaceId}/settings/domain`,
      // },
      {
        name: 'Group Members',
        path: `/account/${workspaceId}/settings/team`,
      },
      {
        name: 'Advanced',
        path: `/account/${workspaceId}/settings/advanced`,
      },
    ],
  },
];

export default menu;
