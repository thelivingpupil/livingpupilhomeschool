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
          if (!validate) return false;
          
          // Then check if there are unpaid August 2025 fees
          if (workspace?.studentRecord?.schoolYear && workspace?.schoolFees) {
            // Check if school year is 2025-2026
            if (workspace.studentRecord.schoolYear === '2025-2026') {
              // Find the initial payment (order 0)
              const initialPayment = workspace.schoolFees.find(fee => fee.order === 0);
              if (initialPayment && initialPayment.transaction && initialPayment.transaction.paymentStatus === 'S') {
                const downpaymentDate = initialPayment.transaction.updatedAt;
                
                // Check each fee for August 2025 deadline
                for (const fee of workspace.schoolFees) {
                  if (fee.order === 0) continue; // Skip initial payment
                  
                  if (fee.transaction && fee.transaction.paymentStatus !== 'S') {
                    // Calculate the deadline for this fee
                    const deadlineStr = getDeadlineForMenu(
                      fee.order,
                      fee.paymentType,
                      downpaymentDate,
                      workspace.studentRecord.schoolYear,
                      fee.transaction.paymentStatus
                    );
                    
                    if (deadlineStr) {
                      // Check if the deadline is in August 2025
                      const deadline = new Date(deadlineStr);
                      if (deadline.getMonth() === 7 && deadline.getFullYear() === 2025) { // August is month 7 (0-indexed)
                        return false; // Hide grades if there are unpaid fees with August 2025 deadline
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

// Helper function to calculate deadlines for menu validation
const getDeadlineForMenu = (index, paymentType, downpaymentDate, schoolYear, paymentStatus) => {
  const date = new Date(downpaymentDate);
  const selectedYear = Number(schoolYear) < date.getFullYear() ? 'laterYear' : 'currentYear';
  
  // Simplified deadline calculation for 2025-2026 school year
  if (schoolYear === '2025-2026') {
    let monthsToAdd = 0;
    
    if (paymentStatus !== 'S') {
      // For unpaid fees, calculate based on payment type and order
      if (paymentType === 'MONTHLY') {
        monthsToAdd = index; // Monthly payments are due each month
      } else if (paymentType === 'QUARTERLY') {
        monthsToAdd = index * 3; // Quarterly payments every 3 months
      } else if (paymentType === 'SEMI_ANNUAL') {
        monthsToAdd = index * 6; // Semi-annual payments every 6 months
      } else if (paymentType === 'ANNUAL') {
        monthsToAdd = 0; // Annual payment is due immediately
      }
    }
    
    const deadline = new Date(date.getFullYear(), date.getMonth() + monthsToAdd, 5);
    return deadline;
  }
  
  return null;
};

export default menu;
