import { GradeLevel } from '@prisma/client';

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

export const RELIGION = {
  ROMAN_CATHOLIC: 'Roman Catholic',
  MUSLIM: 'Muslim',
  BORN_AGAIN_CHRISTIAN: 'Born-Again Christian',
  SEVENT_DAY_ADVENTIST: 'Seventh DaY Adventist',
  IGLESIA_NI_CRISTO: 'Iglesia ni Cristo',
  LATTER_DAY_SAINTS_MORMONS: 'Latter Day Saint (Mormons)',
  OTHERS: 'Others',
};
