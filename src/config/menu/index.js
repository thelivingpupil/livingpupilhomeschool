const menu = (workspaceId) => [
  {
    name: 'Student Record',
    menuItems: [
      {
        name: 'Profile',
        path: `/account/${workspaceId}`,
      },
      // {
      //   name: 'Courses',
      //   path: `/account/${workspaceId}/courses`,
      // },
      // {
      //   name: 'Grades',
      //   path: `/account/${workspaceId}/grades`,
      // },
      {
        name: 'Documents',
        path: `/account/${workspaceId}/documents`,
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
