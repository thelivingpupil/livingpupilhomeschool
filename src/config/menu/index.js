import { getDeadline } from '@/utils/index';

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
        validateItem: (validate, workspace) => {
          // First check if basic validation passes (has paid fees)
          if (!validate) {
            return false;
          }

          // Then check if there are unpaid summer 2025 fees (June, July, August)
          if (workspace?.studentRecord?.schoolYear && workspace?.schoolFees) {
            // Check if school year is 2025-2026
            if (workspace.studentRecord.schoolYear === '2025-2026') {
              // Find the initial payment (order 0)
              const initialPayment = workspace.schoolFees.find(fee => fee.order === 0);

              if (initialPayment && initialPayment.transaction && initialPayment.transaction.paymentStatus === 'S') {
                const downpaymentDate = initialPayment.transaction.updatedAt;

                // Check each fee for summer 2025 deadline
                for (const fee of workspace.schoolFees) {
                  if (fee.order === 0) continue; // Skip initial payment
                  if (fee.deletedAt) continue; // Skip deleted fees

                  if (fee.transaction && fee.transaction.paymentStatus !== 'S') {
                    // Use the proper getDeadline function from utils
                    const deadlineStr = getDeadline(
                      fee.order,
                      fee.paymentType,
                      downpaymentDate,
                      workspace.studentRecord.schoolYear,
                      initialPayment.transaction.paymentStatus  // Use order 0 payment status
                    );

                    if (deadlineStr) {
                      // Check if the deadline is in June, July, or August 2025
                      const deadline = new Date(deadlineStr);
                      const isSummer2025 = deadline.getMonth() >= 5 && deadline.getMonth() <= 7 && deadline.getFullYear() === 2025;

                      if (isSummer2025) {
                        return false; // Hide grades if there are unpaid fees with June, July, or August 2025 deadlines
                      }
                    }
                  }
                }
              }
            }
          }

          return true;
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

// Helper function to get month names
const getMonthName = (monthIndex) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
};

export default menu;
