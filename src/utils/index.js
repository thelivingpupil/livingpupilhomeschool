import { PaymentType } from '@prisma/client';
import add from 'date-fns/add';
import format from 'date-fns/format';
import { addMonths, setDate } from 'date-fns';

const deadlines = {
  currentYear: [
    // January
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0, 0, 0, 0, 0, 0, 0, 0],
    },
    // February
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 6, 11],
      [PaymentType.QUARTERLY]: [0, 6, 9, 12],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    // March
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 5, 10],
      [PaymentType.QUARTERLY]: [0, 5, 8, 11],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    // April
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 4, 9],
      [PaymentType.QUARTERLY]: [0, 4, 7, 10],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    // May
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 3, 8],
      [PaymentType.QUARTERLY]: [0, 3, 6, 9],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    // June
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 7],
      [PaymentType.QUARTERLY]: [0, 2, 5, 8],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    // July
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 3, 8],
      [PaymentType.QUARTERLY]: [0, 3, 6, 8],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    // August
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 7],
      [PaymentType.QUARTERLY]: [0, 2, 4, 7],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    // September
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 7],
      [PaymentType.QUARTERLY]: [0, 2, 4, 7],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    // October
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 6],
      [PaymentType.QUARTERLY]: [0, 2, 5, 7],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    // November
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 6],
      [PaymentType.QUARTERLY]: [0, 2, 4, 6],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
    // December
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 5],
      [PaymentType.QUARTERLY]: [0, 2, 4, 5],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    },
  ],
  laterYear: [
    // January
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 5],
      [PaymentType.QUARTERLY]: [0, 2, 3, 4],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4],
    },
    // February
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 1, 3],
      [PaymentType.QUARTERLY]: [0, 1, 2, 3],
      [PaymentType.MONTHLY]: [0, 1, 2, 3],
    },
    // March
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0, 1, 2, 2],
    },
    // April
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0, 1],
    },
    // May
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
    },
    // June
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
    },
    // July
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
    },
    // August
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
    },
    // September
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
    },
    // October
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
    },
    // November
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
    },
    // December
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
    },
  ],
};

export const getDeadline = (index, paymentType, downpaymentDate, schoolYear, paymentStatus) => {
  const date = new Date(downpaymentDate);
  const selectedYear =
    Number(schoolYear) < date.getFullYear() ? 'laterYear' : 'currentYear';

  let monthsToAdd = 0; // Changed from const to let
  if (paymentStatus !== 'S') {
    monthsToAdd =
      deadlines[selectedYear][date.getMonth()][paymentType][0];
  } else if (paymentStatus === null) {
    monthsToAdd =
      deadlines[selectedYear][date.getMonth()][paymentType][index];
  } else {
    monthsToAdd =
      deadlines[selectedYear][date.getMonth()][paymentType][index];
  }

  const deadline = add(new Date(date.getFullYear(), date.getMonth(), 5), {
    months: monthsToAdd,
  });

  return monthsToAdd !== null && monthsToAdd !== undefined
    ? format(deadline, 'MMMM dd, yyyy')
    : null;
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};


export const getOrderFeeDeadline = (index, paymentType, dateOrdered) => {
  const monthsIteration = {
    FULL_PAYMENT: [0],
    INSTALLMENT: [1, 2, 3, 4, 5],
  };

  // Check if the paymentType exists in monthsIteration
  if (!monthsIteration[paymentType]) {
    throw new Error("Invalid payment type");
  }

  // If paymentType is FULL_PAYMENT, set the deadline to the next day
  if (paymentType === "FULL_PAYMENT") {
    const deadline = new Date(dateOrdered);
    deadline.setDate(deadline.getDate() + 1);
    return deadline;
  }

  // Get the number of months to add based on the index
  const monthsToAdd = monthsIteration[paymentType][index];

  if (monthsToAdd === undefined) {
    throw new Error("Invalid index for the given payment type");
  }

  // Create a new date object from dateOrdered and add the corresponding months
  const deadline = new Date(dateOrdered);
  deadline.setMonth(deadline.getMonth() + monthsToAdd);

  // Ensure the deadline is set to the 30th day of the month
  // Handle February separately
  const year = deadline.getFullYear();
  const month = deadline.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate(); // Last day of the month

  // If February has fewer than 30 days, set the deadline to the last day of February
  if (month === 1 && lastDayOfMonth < 30) {
    deadline.setDate(lastDayOfMonth);
  } else {
    // Otherwise, set to the 30th of the month or the last day if the month has fewer days
    deadline.setDate(Math.min(30, lastDayOfMonth));
  }

  return deadline;
};

export const getParentFirstName = (fullName) => {
  if (!fullName) return ''; // Handle cases where the name is undefined or empty
  const nameParts = fullName.split(' ');
  return nameParts[0]; // Return the first part (first name)
}

// Function to get email credentials for each sender
export const getSenderCredentials = (sender) => {
  let senderName, email, appPassword;

  switch (sender) {
    case 'admin':
      senderName = "LP Admin";
      email = process.env.ADMIN_EMAIL;
      appPassword = process.env.ADMIN_APP_PASSWORD;
      break;
    case 'finance':
      senderName = "LP Finance";
      email = process.env.FINANCE_EMAIL;
      appPassword = process.env.FINANCE_APP_PASSWORD;
      break;
    case 'shop':
      senderName = "LP Shop";
      email = process.env.SHOP_EMAIL;
      appPassword = process.env.SHOP_APP_PASSWORD;
      break;
    case 'coo':
      senderName = "LP COO";
      email = process.env.COO_EMAIL;
      appPassword = process.env.COO_APP_PASSWORD;
      break;
    case 'directress':
      senderName = "LP Directress";
      email = process.env.DIRECTRESS_EMAIL;
      appPassword = process.env.DIRECTRESS_APP_PASSWORD;
      break;
    case 'cottage':
      senderName = "LP Cottage Coordinator";
      email = process.env.COTTAGE_EMAIL;
      appPassword = process.env.COTTAGE_APP_PASSWORD;
      break;
    default:
      throw new Error(`Unknown sender: ${sender}`);
  }

  return { senderName, email, appPassword };
};

// Function to get sender details
export const getSenderDetails = (sender) => {
  let senderRole, senderFullName;

  switch (sender) {
    case 'admin':
      senderRole = "Admin Officer"
      senderFullName = "Ameline Baran"
      break;
    case 'finance':
      senderRole = "Finance Officer"
      senderFullName = "Karen Yap"
      break;
    case 'shop':
      senderRole = "Admin Assistant"
      senderFullName = "Mynelyn Namacpacan"
      break;
    case 'coo':
      senderRole = "Chief Operations Officer"
      senderFullName = "Arjeli Ricarte"
      break;
    case 'directress':
      senderRole = "Directress"
      senderFullName = "Azenith Jacalan"
      break;
    case 'cottage':
      senderRole = "Homeschool Cottage Coordinator"
      senderFullName = "Joshua Jacalan"
      break;
    default:
      throw new Error(`Unknown sender: ${sender}`);
  }

  return { senderRole, senderFullName };
};