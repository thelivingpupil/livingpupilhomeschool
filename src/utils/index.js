import add from 'date-fns/add';
import format from 'date-fns/format';

const deadlines = {
  currentYear: [
    // January
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
    },
    // February
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 6, 11],
      [PaymentType.QUARTERLY]: [0, 6, 9, 12],
    },
    // March
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 5, 10],
      [PaymentType.QUARTERLY]: [0, 5, 8, 11],
    },
    // April
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 4, 9],
      [PaymentType.QUARTERLY]: [0, 4, 7, 10],
    },
    // May
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 3, 8],
      [PaymentType.QUARTERLY]: [0, 3, 6, 9],
    },
    // June
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 7],
      [PaymentType.QUARTERLY]: [0, 2, 5, 8],
    },
    // July
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 3, 8],
      [PaymentType.QUARTERLY]: [0, 3, 6, 8],
    },
    // August
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 3, 8],
      [PaymentType.QUARTERLY]: [0, 3, 6, 8],
    },
    // September
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 7],
      [PaymentType.QUARTERLY]: [0, 2, 5, 8],
    },
    // October
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 6],
      [PaymentType.QUARTERLY]: [0, 2, 5, 7],
    },
    // November
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 6],
      [PaymentType.QUARTERLY]: [0, 2, 4, 6],
    },
    // December
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 5],
      [PaymentType.QUARTERLY]: [0, 2, 4, 5],
    },
  ],
  laterYear: [
    // January
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 2, 5],
      [PaymentType.QUARTERLY]: [0, 2, 4, 5],
    },
    // February
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 1, 4],
      [PaymentType.QUARTERLY]: [0, 1, 3, 4],
    },
    // March
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
    },
    // April
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
    },
    // May
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
    },
    // June
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
    },
    // July
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
    },
    // August
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
    },
    // September
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
    },
    // October
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
    },
    // November
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
    },
    // December
    {
      [PaymentType.ANNUAL]: [0],
      [PaymentType.SEMI_ANNUAL]: [0, 0, 0],
      [PaymentType.QUARTERLY]: [0, 0, 0, 0],
    },
  ],
};

export const getDeadline = (index, paymentType, createdDate, schoolYear) => {
  const date = new Date(createdDate);
  const selectedYear =
    Number(schoolYear) < date.getFullYear() ? 'laterYear' : 'currentYear';

  const monthsToAdd =
    deadlines[selectedYear][date.getMonth()][paymentType][index];
  const deadline = add(new Date(date.getFullYear(), date.getMonth(), 5), {
    months: monthsToAdd,
  });

  return monthsToAdd && format(deadline, 'MMMM dd, yyyy');
};
