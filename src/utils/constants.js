import { GradeLevel } from '@prisma/client';

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
  WITH_TWO_DAYS_TUTOR: 'with 2 days tutor',
};

export const PAYMENT_TYPE = {
  ANNUAL: 'Full Payment',
  SEMI_ANNUAL: 'Three (3) Term Payment',
  QUARTERLY: 'Four (4) Term Payment',
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
