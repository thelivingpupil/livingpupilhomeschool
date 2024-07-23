import { GradeLevel } from '@prisma/client';

export const SCHOOL_YEAR = {
  SY_2023_2024: '2023-2024',
  SY_2024_2025: '2024-2025',
}

export const ACCREDITATION = {
  LOCAL: 'DepEd Accreditation (Local)',
  INTERNATIONAL: 'US Accreditation (International)',
  DUAL: 'DepEd & US Accreditation (Dual)',
  FORM_ONE: 'DepEd Accreditation Form 1 (Grades 1-3)',
  FORM_TWO: 'DepEd Accreditation Form 2 (Grades 4-6)',
  FORM_THREE: 'DepEd Accreditation Form 3 (Grades 7-10)',
};

export const ACCREDITATION_NEW = {
  LOCAL: 'DepEd Accreditation (Local)',
  INTERNATIONAL: 'US Accreditation (International)',
  DUAL: 'DepEd & US Accreditation (Dual)',
};

export const ENROLLMENT_TYPE = {
  CONTINUING: 'Continuing Family',
  NEW: 'New Family',
};

export const FEES = {
  ONLINE: 10,
  OTC: 15,
  PAYMENT_CENTERS: 20,
};

export const GRADE_LEVEL = {
  PRESCHOOL: 'Preschool',
  K1: 'Kindergarten 1',
  K2: 'Kindergarten 2',
  GRADE_1: 'Grade 1',
  GRADE_2: 'Grade 2',
  GRADE_3: 'Grade 3',
  GRADE_4: 'Grade 4',
  GRADE_5: 'Grade 5',
  GRADE_6: 'Grade 6',
  GRADE_7: 'Grade 7',
  GRADE_8: 'Grade 8',
  GRADE_9: 'Grade 9',
  GRADE_10: 'Grade 10',
  GRADE_11: 'Grade 11',
  GRADE_12: 'Grade 12',
};

export const GRADE_LEVEL_TYPES = {
  PRESCHOOL: 'PRESCHOOL',
  K1: 'K1',
  K2: 'K2',
  FORM_1: 'FORM_1',
  GRADE_1: 'GRADE_1',
  GRADE_2: 'GRADE_2',
  GRADE_3: 'GRADE_3',
  FORM_2: 'FORM_2',
  GRADE_4: 'GRADE_4',
  GRADE_5: 'GRADE_5',
  GRADE_6: 'GRADE_6',
  FORM_3: 'FORM_3',
  GRADE_7: 'GRADE_7',
  GRADE_8: 'GRADE_8',
  GRADE_9: 'GRADE_9',
  GRADE_10: 'GRADE_10',
  GRADE_11: 'GRADE_11',
  GRADE_12: 'GRADE_12',
};

export const GRADE_TO_FORM_MAP = {
  PRESCHOOL: 'PRESCHOOL',
  K1: 'K1',
  K2: 'K2',
  GRADE_1: 'FORM_1',
  GRADE_2: 'FORM_1',
  GRADE_3: 'FORM_1',
  GRADE_4: 'FORM_2',
  GRADE_5: 'FORM_2',
  GRADE_6: 'FORM_2',
  GRADE_7: 'FORM_3',
  GRADE_8: 'FORM_3',
  GRADE_9: 'FORM_3',
  GRADE_10: 'FORM_3',
  GRADE_11: 'GRADE_11',
  GRADE_12: 'GRADE_12',
};

export const GRADE_LEVEL_HEADER = {
  PRESCHOOL: 'Preschool',
  K1: 'K1',
  K2: 'K2',
  FORM_1: 'Form 1 (Grades 1-3)',
  GRADE_1: 'Grade School',
  GRADE_2: 'Grade School',
  GRADE_3: 'Grade School',
  FORM_2: 'Form 2 (Grades 4-6)',
  GRADE_4: 'Grade School',
  GRADE_5: 'Grade School',
  GRADE_6: 'Grade School',
  FORM_3: 'Form 3 (Grades 7-10)',
  GRADE_7: 'Grade 7-8',
  GRADE_8: 'Grade 7-8',
  GRADE_9: 'Grade 9-10',
  GRADE_10: 'Grade 9-10',
  GRADE_11: 'Senior High',
  GRADE_12: 'Senior High',
};

export const GRADE_LEVEL_GROUPS = [
  {
    name: 'Pre-school',
    levels: [GradeLevel.PRESCHOOL],
  },
  {
    name: 'Kindergarten',
    levels: [GradeLevel.K1, GradeLevel.K2],
  },
  {
    name: 'Grade School',
    levels: [
      GradeLevel.GRADE_1,
      GradeLevel.GRADE_2,
      GradeLevel.GRADE_3,
      GradeLevel.GRADE_4,
      GradeLevel.GRADE_5,
      GradeLevel.GRADE_6,
    ],
  },
  {
    name: 'High School',
    levels: [
      GradeLevel.GRADE_7,
      GradeLevel.GRADE_8,
      GradeLevel.GRADE_9,
      GradeLevel.GRADE_10,
    ],
  },
  {
    name: 'Senior High School',
    levels: [GradeLevel.GRADE_11, GradeLevel.GRADE_12],
  },
];

export const COTTAGE_TYPE = {
  THREE_DAYS_A_WEEK: '3 days a week',
  FIVE_DAYS_A_WEEK: '5 days a week',
};

export const PAYMENT_TYPE = {
  ANNUAL: 'Full Payment',
  SEMI_ANNUAL: 'Three (3) Term Payment',
  QUARTERLY: 'Four (4) Term Payment',
  MONTHLY: 'Nine (9) Term Payment',
};

export const PAYMENT_METHOD = {
  ONLINE: 'Online Banking',
  OTC: 'Over-the-Counter Banking',
  PAYMENT_CENTERS: 'Payment Centers',
};

export const PROGRAM = {
  HOMESCHOOL_PROGRAM: 'Homeschool Program',
  HOMESCHOOL_COTTAGE: ' Homeschool Cottage',
};

export const RELIGION = {
  ROMAN_CATHOLIC: 'Roman Catholic',
  MUSLIM: 'Muslim',
  BORN_AGAIN_CHRISTIAN: 'Born-Again Christian',
  SEVENT_DAY_ADVENTIST: 'Seventh Day Adventist',
  IGLESIA_NI_CRISTO: 'Iglesia ni Cristo',
  LATTER_DAY_SAINTS_MORMONS: 'Latter Day Saint (Mormons)',
  OTHERS: 'Others',
};

export const STATUS = {
  S: 'Success',
  F: 'Failure',
  P: 'Pending',
  U: 'Future',
  R: 'Refund',
  K: 'Chargeback',
  V: 'Void',
  A: 'Authorized',
};

export const STATUS_TEXT_COLOR = {
  S: 'text-green-600',
  F: 'text-red-600',
  P: 'text-cyan-600',
  U: 'text-gray-400',
  R: 'text-purple-600',
  K: 'text-blue-600',
  V: 'text-primary-500',
  A: 'text-secondary-500',
};

export const STATUS_BG_COLOR = {
  S: 'bg-green-600 text-white',
  F: 'bg-red-600',
  P: 'bg-cyan-600 text-white',
  U: 'bg-gray-400',
  R: 'bg-purple-600',
  K: 'bg-blue-600',
  V: 'bg-primary-500',
  A: 'bg-secondary-500',
};

export const ENROLLMENT_STATUS_BG_COLOR = {
  ENROLLED: 'bg-green-600 text-white',
  INITIALLY_ENROLLED: 'bg-blue-600 text-white',
  DROPEED: 'bg-red-600 text-white',
  PENDING: 'bg-yellow-600 text-white',
};

export const SHOP_SHIPPING_TYPE = {
  WITHIN_CEBU: 'Within Cebu',
  NCR: 'NCR',
  NORTH_LUZON: 'North Luzon',
  SOUTH_LUZON: 'South Luzon',
  VISAYAS: 'Other Visayas Region',
  MINDANAO: 'Mindanao',
  ISLANDER: 'Islander',
};

export const STUDENT_STATUS = {
  ENROLLED: 'ENROLLED',
  PENDING: 'PENDING',
  DROPPED: 'DROPPED',
  INITIALLY_ENROLLED: 'INITIALLY ENROLLED',
}

//this is used for the monthly iteration in createSchoolFees()
export const MONTHLY_INDEX = {
  FEBRAURY_2024: 8,
  MARCH_2024: 8,
  APRIL_2024: 8,
  MAY_2024: 8,
  JUNE_2024: 8,
  JULY_2024: 8,
  AUGUST_2024: 8,
  SEPTEMBER_2024: 8,
  OCTOBER_2024: 7,
  NOVEMBER_2024: 6,
  DECEMBER_2024: 5,
  JANRUARY_2025: 4,
  FEBRAURY_2025: 3,
  MARCH_2025: 3,
  APRIL_2025: 1,
}

//function to get the current month and year with format with the format of MONTHLY_INDEX
export const getMonthIndex = (date) => {
  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  const formattedMonthYear = monthNames[date.getMonth()] + '_' + date.getFullYear();

  return MONTHLY_INDEX[formattedMonthYear];
};

//function to get monthly payment
export const calculateMonthlyPayment = (monthIndex, programFeeByAccreditation) => {
  const payments = programFeeByAccreditation?.paymentTerms[3] || {};
  const sum = (payments.secondPayment || 0)
    + (payments.thirdPayment || 0)
    + (payments.fourthPayment || 0)
    + (payments.fifthPayment || 0)
    + (payments.sixthPayment || 0)
    + (payments.seventhPayment || 0)
    + (payments.eighthPayment || 0)
    + (payments.ninthPayment || 0);

  const result = sum / monthIndex;
  return result
};

