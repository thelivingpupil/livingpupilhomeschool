import { PaymentType } from '@prisma/client';
import add from 'date-fns/add';
import format from 'date-fns/format';
import { addMonths, setDate } from 'date-fns';
import { ShippingType } from '@prisma/client';

const deadlines = {
  currentYear: [
    // January
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 5, 8],
      [PaymentType.QUARTERLY]: [0, 5, 3, 3],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // February
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 4, 9],
      [PaymentType.QUARTERLY]: [0, 4, 8, 10],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // March
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 3, 6],
      [PaymentType.QUARTERLY]: [0, 3, 6, 9],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // April
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 3, 5],
      [PaymentType.QUARTERLY]: [0, 3, 6, 9],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // May
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 1, 5],
      [PaymentType.QUARTERLY]: [0, 3, 6, 9],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // June
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 5],
      [PaymentType.QUARTERLY]: [0, 3, 6, 8],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // July
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 3, 6],
      [PaymentType.QUARTERLY]: [0, 3, 6, 7],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7],
      [PaymentType.PAY_ALL]: [0],
    },
    // August
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 3, 6],
      [PaymentType.QUARTERLY]: [0, 2, 4, 6],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6],
      [PaymentType.PAY_ALL]: [0],
    },
    // September
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 1, 5],
      [PaymentType.QUARTERLY]: [0, 2, 4, 5],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5],
      [PaymentType.PAY_ALL]: [0],
    },
    // October
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 1, 4],
      [PaymentType.QUARTERLY]: [0, 2, 3, 4],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5],
      [PaymentType.PAY_ALL]: [0],
    },
    // November
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 3],
      [PaymentType.QUARTERLY]: [0, 2, 3, 0],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5],
      [PaymentType.PAY_ALL]: [0],
    },
    // December
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 1, 2],
      [PaymentType.QUARTERLY]: [0, 1, 2],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5],
      [PaymentType.PAY_ALL]: [0],
    },
  ],
  laterYear: [
    // January
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 1],
      [PaymentType.QUARTERLY]: [0, 1],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5],
      [PaymentType.PAY_ALL]: [0],
    },
    // February
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 1, 3],
      [PaymentType.QUARTERLY]: [0, 1, 2, 3],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5],
      [PaymentType.PAY_ALL]: [0],
    },
    // March
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5],
      [PaymentType.PAY_ALL]: [0],
    },
    // April
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // May
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // June
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // July
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // August
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // September
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // October
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // November
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // December
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
  ],
};

const deadlines2025 = {
  currentYear: [
    // January
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 5, 8],
      [PaymentType.QUARTERLY]: [0, 5, 3, 3],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // February
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 4, 9],
      [PaymentType.QUARTERLY]: [0, 4, 8, 10],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // March
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 3, 6],
      [PaymentType.QUARTERLY]: [0, 3, 6, 9],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // April
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 3, 7],
      [PaymentType.QUARTERLY]: [0, 3, 6, 9],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // May
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 3, 6],
      [PaymentType.QUARTERLY]: [0, 3, 6, 9],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // June
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 3, 6],
      [PaymentType.QUARTERLY]: [0, 3, 6, 8],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // July
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 3, 6],
      [PaymentType.QUARTERLY]: [0, 3, 6, 7],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // August
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 3, 6],
      [PaymentType.QUARTERLY]: [0, 2, 4, 6],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // September
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 1, 5],
      [PaymentType.QUARTERLY]: [0, 2, 4, 5],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // October
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 1, 4],
      [PaymentType.QUARTERLY]: [0, 2, 3, 4],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // November
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 3],
      [PaymentType.QUARTERLY]: [0, 2, 3, 0],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // December
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 1, 2],
      [PaymentType.QUARTERLY]: [0, 1, 2],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
  ],
  laterYear: [
    // January
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 1],
      [PaymentType.QUARTERLY]: [0, 1],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // February
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 1, 3],
      [PaymentType.QUARTERLY]: [0, 1, 2, 3],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // March
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      [PaymentType.PAY_ALL]: [0],
    },
    // April
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // May
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // June
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // July
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // August
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // September
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // October
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // November
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
    // December
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
      [PaymentType.MONTHLY]: [0],
      [PaymentType.PAY_ALL]: [0],
    },
  ],
};

export const getDeadline = (index, paymentType, downpaymentDate, schoolYear, paymentStatus) => {
  const date = new Date(downpaymentDate);
  const selectedYear =
    Number(schoolYear) < date.getFullYear() ? 'laterYear' : 'currentYear';

  let monthsToAdd = 0; // Changed from const to let
  if (schoolYear === '2024-2025' || schoolYear === '2023') {
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
  } else {
    if (paymentStatus !== 'S') {
      monthsToAdd =
        deadlines2025[selectedYear][date.getMonth()][paymentType][0];
    } else if (paymentStatus === null) {
      monthsToAdd =
        deadlines2025[selectedYear][date.getMonth()][paymentType][index];
    } else {
      monthsToAdd =
        deadlines2025[selectedYear][date.getMonth()][paymentType][index];
    }
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
    case 'international':
      senderName = "LP International Coordinator";
      email = "livingpupilinternational@gmail.com"
      appPassword = null;
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
      senderRole = "Admin Assistant"
      senderFullName = "Mynelyn C. Namacpacan"
      break;
    case 'finance':
      senderRole = "Finance Officer"
      senderFullName = "Karen Yap"
      break;
    case 'shop':
      senderRole = ""
      senderFullName = "Living Pupil Homeschool Team"
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
    case 'international':
      senderRole = "International Coordinator"
      senderFullName = "Annie Simacas"
      break;
    default:
      throw new Error(`Unknown sender: ${sender}`);
  }

  return { senderRole, senderFullName };
};

export const getShippingTypeFromAddress = (address) => {
  const lowerAddress = address.toLowerCase();

  const withinCebuCities = [
    'mandaue city',
    'consolacion',
    'lapu-lapu city',
    'cebu city',
    'talisay city',
    'minglanilia',
    'naga city',
    'compostela',
  ];

  for (const city of withinCebuCities) {
    if (lowerAddress.includes(city)) {
      return ShippingType.WITHIN_CEBU;
    }
  }

  if (
    lowerAddress.includes('iloilo') ||
    lowerAddress.includes('negros') ||
    lowerAddress.includes('leyte') ||
    lowerAddress.includes('samar') ||
    lowerAddress.includes('bohol')
  ) {
    return ShippingType.VISAYAS;
  }

  if (
    lowerAddress.includes('manila') ||
    lowerAddress.includes('quezon city') ||
    lowerAddress.includes('pasig') ||
    lowerAddress.includes('makati') ||
    lowerAddress.includes('taguig') ||
    lowerAddress.includes('mandaluyong') ||
    lowerAddress.includes('ncr')
  ) {
    return ShippingType.NCR;
  }

  if (
    lowerAddress.includes('ilocos') ||
    lowerAddress.includes('la union') ||
    lowerAddress.includes('benguet') ||
    lowerAddress.includes('baguio') ||
    lowerAddress.includes('pangasinan') ||
    lowerAddress.includes('cagayan') ||
    lowerAddress.includes('isabela') ||
    lowerAddress.includes('tarlac') ||
    lowerAddress.includes('zambales') ||
    lowerAddress.includes('aurora')
  ) {
    return ShippingType.NORTH_LUZON;
  }

  if (
    lowerAddress.includes('laguna') ||
    lowerAddress.includes('batangas') ||
    lowerAddress.includes('cavite') ||
    lowerAddress.includes('rizal') ||
    lowerAddress.includes('quezon province') ||
    lowerAddress.includes('lucena') ||
    lowerAddress.includes('albay') ||
    lowerAddress.includes('sorsogon')
  ) {
    return ShippingType.SOUTH_LUZON;
  }

  if (
    lowerAddress.includes('davao') ||
    lowerAddress.includes('zamboanga') ||
    lowerAddress.includes('bukidnon') ||
    lowerAddress.includes('misamis') ||
    lowerAddress.includes('cotabato') ||
    lowerAddress.includes('sarangani')
  ) {
    return ShippingType.MINDANAO;
  }

  if (
    lowerAddress.includes('palawan') ||
    lowerAddress.includes('batanes') ||
    lowerAddress.includes('siargao') ||
    lowerAddress.includes('camiguin') ||
    lowerAddress.includes('basilan')
  ) {
    return ShippingType.ISLANDER;
  }

  // Default fallback
  return ShippingType.VISAYAS;
};

export const calculateShippingFeeFromAddress = (address, itemCount) => {
  const shippingType = getShippingTypeFromAddress(address);
  const lowerAddress = address.toLowerCase();

  if (shippingType === ShippingType.WITHIN_CEBU) {
    const cebuRates = {
      'mandaue city': 130,
      'consolacion': 140,
      'lapu-lapu city': 150,
      'cebu city': 160,
      'talisay city': 170,
      'minglanilia': 180,
      'naga city': 200,
      'compostela': 200,
    };

    for (const city in cebuRates) {
      if (lowerAddress.includes(city)) {
        return cebuRates[city];
      }
    }

    return 160; // fallback
  }

  if (itemCount >= 25) return 500;
  if (itemCount >= 10) return 400;
  return 300;
};