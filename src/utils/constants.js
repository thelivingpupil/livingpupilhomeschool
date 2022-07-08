import { GradeLevel } from '@prisma/client';

export const ACCREDITATION = {
  LOCAL: 'DepEd Accreditation (Local)',
  INTERNATIONAL: 'US Accreditation (International)',
  DUAL: 'DepEd & US Accreditation (Dual)',
  FORM_ONE: 'DepEd Accreditation Form 1 (Grades 1-3)',
  FORM_TWO: 'DepEd Accreditation Form 2 (Grades 4-6)',
  FORM_THREE: 'DepEd Accreditation Form 3 (Grades 7-10)',
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

export const PAYMENT_TYPE = {
  ANNUAL: 'Annual',
  SEMI_ANNUAL: 'Semi-Annual',
  QUARTERLY: 'Quarterly',
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
  SEVENT_DAY_ADVENTIST: 'Seventh DaY Adventist',
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
