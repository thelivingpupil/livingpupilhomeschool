import { GradeLevel } from '@prisma/client';

export const SCHOOL_YEAR = {
  SY_2025_2026: '2025-2026',
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
  ONLINE: 20,
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

export const GRADE_LEVEL_FORMS = {
  PRESCHOOL: ['PRESCHOOL'],
  KINDERGARTEN: ['K1', 'K2'],
  FORM_1: ['GRADE_1', 'GRADE_2', 'GRADE_3'],
  FORM_2: ['GRADE_4', 'GRADE_5', 'GRADE_6'],
  FORM_3: ['GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10'],
  SENIOR_HIGH: ['GRADE_11', 'GRADE_12']
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
  PAY_ALL: 'Pay All Fees'
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

export const DOC_STATUS_BG_COLOR = {
  Received: 'bg-orange-600 text-white',
  In_Progress: 'bg-primary-600 text-white',
  Completed: 'bg-green-600 text-white',
  Cancelled: 'bg-red-600 text-white',
  Pending: 'bg-yellow-600 text-white',
  For_Delivery: 'bg-primary-600 text-white',
  For_Pickup: 'bg-primary-600 text-white',
  For_Document_Receipt: 'bg-primary-600 text-white',
};

export const DOC_STATUS = {
  Received: 'Recieved',
  In_Progress: 'In Progress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
  Pending: 'Pending',
  For_Delivery: 'For Delivery',
  For_Pickup: 'For Pickup',
  For_Document_Receipt: 'For Document Receipt',
  For_Document_Received: 'For Document Received'
}

export const ENROLLMENT_STATUS_BG_COLOR = {
  ENROLLED: 'bg-green-600 text-white',
  INITIALLY_ENROLLED: 'bg-blue-600 text-white',
  DROPPED: 'bg-red-600 text-white',
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
  PICK_UP: 'Pick up',
};

export const STUDENT_STATUS = {
  ENROLLED: 'ENROLLED',
  PENDING: 'PENDING',
  DROPPED: 'DROPPED',
  INITIALLY_ENROLLED: 'INITIALLY ENROLLED',
}

//this is used for the monthly iteration in createSchoolFees()
export const MONTHLY_INDEX = {
  FEBRUARY_2024: 8,
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
  JANUARY_2025: 4,
  FEBRUARY_2025: 3,
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

//this is used for the monthly iteration in createSchoolFees()
export const MONTHLY_INDEX_CURRENT = {
  JANUARY_2025: 8,
  FEBRUARY_2025: 8,
  MARCH_2025: 8,
  APRIL_2025: 8,
  MAY_2025: 8,
  JUNE_2025: 8,
  JULY_2025: 8,
  AUGUST_2025: 8,
  SEPTEMBER_2025: 8,
  OCTOBER_2025: 7,
  NOVEMBER_2025: 6,
  DECEMBER_2025: 5,
  JANUARY_2026: 4,
  FEBRUARY_2026: 3,
  MARCH_2026: 3,
  APRIL_2026: 1,
}

//function to get the current month and year with format with the format of MONTHLY_INDEX
export const getMonthIndexCurrent = (date) => {
  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  const formattedMonthYear = monthNames[date.getMonth()] + '_' + date.getFullYear();

  return MONTHLY_INDEX_CURRENT[formattedMonthYear];
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

//Document details for registrar portal
export const DOCUMENT_DETAILS = {
  good_moral: {
    value: "good_moral",
    label: "Good Moral Certificate",
    fee: 150,
    requirement: "N/A",
    processing_time: "3-5 business days"
  },
  form_138: {
    value: "form_138",
    label: "Report Card / Form 138",
    fee: 0,
    requirement: "N/A",
    processing_time: "5-7 business days"
  },
  re_form_138: {
    value: "re_form_138",
    label: "Reissuance of Report Card / Form 138",
    fee: 150,
    requirement: "Affidavit of Loss",
    processing_time: "5-7 business days"
  },
  form_137: {
    value: "form_137",
    label: "Permanent Record / Form 137 / SF10",
    fee: 300,
    requirement: "Official Request Letter",
    processing_time: "7-14 business days"
  },
  certificate_of_no_financial_obligation: {
    value: "certificate_of_no_financial_obligation",
    label: "Certificate of No Financial Obligation",
    fee: 0,
    requirement: "N/A",
    processing_time: "3-5 business days"
  },
  certificate_of_enrollment: {
    value: "certificate_of_enrollment",
    label: "Certificate of Enrollment",
    fee: 0,
    requirement: "N/A",
    processing_time: "3-5 business days"
  },
  eccd: {
    value: "eccd",
    label: "ECCD",
    fee: 150,
    requirement: {
      letter: "Request Letter",
      form: "Filled out ECCD form"
    },
    processing_time: "5-7 business days"
  },
}

export const PURPOSE_OPTIONS = [
  { value: "", label: "Select Purpose" },
  { value: "visa", label: "VISA" },
  { value: "school-request", label: "School Request" },
  { value: "unit-district-meet", label: "Unit/District Meet" },
];

export const PARENT_TRAINING_STATUS_BG_COLOR = {
  FINISHED: 'bg-green-600 text-white',
  UNFINISHED: 'bg-secondary-500 text-white',
};

export const PARENT_TRAINING_CODES = {
  'PT12025': {
    name: "The Heart of Learning: Cultivating Atmosphere, Discipline, and Life",
    code: "250720838017454",
    sequence: "Parent Training 1"
  },
  'PT22025A': {
    name: "The Feast (Kindergarten)",
    code: "250721502901445",
    sequence: "Parent Training 2"
  },
  'PT22025B': {
    name: "The Feast (Form 1)",
    code: "250721502901445",
    sequence: "Parent Training 2"
  },
  'PT22025C': {
    name: "The Feast (Form 2)",
    code: "250721502901445",
    sequence: "Parent Training 2"
  },
  'PT22025D': {
    name: "The Feast (Form 3)",
    code: "250721502901445",
    sequence: "Parent Training 2"
  },
  'PT32025': {
    name: "Know and Tell: The Power of Narration",
    code: "250721715259457",
    sequence: "Parent Training 3"
  },
  'PT42025': {
    name: "Wonder and Wisdom: The Importance of Nature Study in Charlotte Mason Education",
    code: "250721126530445",
    sequence: "Parent Training 4"
  },
  'PT52025': {
    name: "Language Arts: Copywork, Transcription, Dictation, Oral Narration, Written Narration, Grammar",
    code: "250721217308449",
    sequence: "Parent Training 5"
  },
  'PT62025': {
    name: "The riches in Common Subjects: Recitation, Hymn, Folksongs, Composer Study, Artist Study",
    code: "250721467672460",
    sequence: "Parent Training 6"
  },
  'PT72025': {
    name: "Living Journals: Essential Notebooks for a Charlotte Mason Education",
    code: "250721677794468",
    sequence: "Parent Training 7"
  },
  'PT82025': {
    name: "The Blueprint",
    code: "250721366816458",
    sequence: "Parent Training 8"
  },
  'PT92025': {
    name: "The Timetable",
    code: "250722334457455",
    sequence: "Parent Training 9"
  },
  'PT102025': {
    name: "Developing a Rhytmn: Education is Life",
    code: "250721545672457",
    sequence: "Parent Training 10"
  }
}


export const PARENT_TRAINING_PER_GRADE_LEVEL = {
  PRESCHOOL: {
    'PT12025': "The Heart of Learning: Cultivating Atmosphere, Discipline, and Life",
    'PT22025': "2. The Feast (K, Form 1,2,3)",
    'PT42025': "Wonder and Wisdom: The Importance of Nature Study in Charlotte Mason Education",
    'PT62025': "The riches in Common Subjects: Recitation, Hymn, Folksongs, Composer Study, Artist Study",
    'PT82025': "The Blueprint",
    'PT92025': "The Timetable",
    'PT102025': "Developing a Rhytmn: Education is Life"
  },
  K1: {
    'PT12025': "The Heart of Learning: Cultivating Atmosphere, Discipline, and Life",
    'PT22025A': "The Feast (Kindergarten)",
    'PT42025': "Wonder and Wisdom: The Importance of Nature Study in Charlotte Mason Education",
    'PT62025': "The riches in Common Subjects: Recitation, Hymn, Folksongs, Composer Study, Artist Study",
    'PT82025': "The Blueprint",
    'PT92025': "The Timetable",
    'PT102025': "Developing a Rhytmn: Education is Life"
  },
  K2: {
    'PT12025': "The Heart of Learning: Cultivating Atmosphere, Discipline, and Life",
    'PT22025A': "2. The Feast (Kindergarten)",
    'PT42025': "Wonder and Wisdom: The Importance of Nature Study in Charlotte Mason Education",
    'PT62025': "The riches in Common Subjects: Recitation, Hymn, Folksongs, Composer Study, Artist Study",
    'PT82025': "The Blueprint",
    'PT92025': "The Timetable",
    'PT102025': "Developing a Rhytmn: Education is Life"
  },
  GRADE_1: {
    'PT12025': "The Heart of Learning: Cultivating Atmosphere, Discipline, and Life",
    'PT22025B': "The Feast (Form 1)",
    'PT32025': "Know and Tell: The Power of Narration",
    'PT42025': "Wonder and Wisdom: The Importance of Nature Study in Charlotte Mason Education",
    'PT52025': "Language Arts: Copywork, Transcription, Dictation, Oral Narration, Written Narration, Grammar",
    'PT62025': "The riches in Common Subjects: Recitation, Hymn, Folksongs, Composer Study, Artist Study",
    'PT72025': "Living Journals: Essential Notebooks for a Charlotte Mason Education",
    'PT82025': "The Blueprint",
    'PT92025': "The Timetable",
    'PT102025': "Developing a Rhytmn: Education is Life"
  },
  GRADE_2: {
    'PT12025': "The Heart of Learning: Cultivating Atmosphere, Discipline, and Life",
    'PT22025B': "The Feast (Form 1)",
    'PT32025': "Know and Tell: The Power of Narration",
    'PT42025': "Wonder and Wisdom: The Importance of Nature Study in Charlotte Mason Education",
    'PT52025': "Language Arts: Copywork, Transcription, Dictation, Oral Narration, Written Narration, Grammar",
    'PT62025': "The riches in Common Subjects: Recitation, Hymn, Folksongs, Composer Study, Artist Study",
    'PT72025': "Living Journals: Essential Notebooks for a Charlotte Mason Education",
    'PT82025': "The Blueprint",
    'PT102025': "Developing a Rhytmn: Education is Life"
  },
  GRADE_3: {
    'PT12025': "The Heart of Learning: Cultivating Atmosphere, Discipline, and Life",
    'PT22025B': "The Feast (Form 1)",
    'PT32025': "Know and Tell: The Power of Narration",
    'PT42025': "Wonder and Wisdom: The Importance of Nature Study in Charlotte Mason Education",
    'PT52025': "Language Arts: Copywork, Transcription, Dictation, Oral Narration, Written Narration, Grammar",
    'PT62025': "The riches in Common Subjects: Recitation, Hymn, Folksongs, Composer Study, Artist Study",
    'PT72025': "Living Journals: Essential Notebooks for a Charlotte Mason Education",
    'PT82025': "The Blueprint",
    'PT92025': "The Timetable",
    'PT102025': "Developing a Rhytmn: Education is Life"
  },
  GRADE_4: {
    'PT12025': "The Heart of Learning: Cultivating Atmosphere, Discipline, and Life",
    'PT22025C': "The Feast (Form 2)",
    'PT32025': "Know and Tell: The Power of Narration",
    'PT42025': "Wonder and Wisdom: The Importance of Nature Study in Charlotte Mason Education",
    'PT52025': "Language Arts: Copywork, Transcription, Dictation, Oral Narration, Written Narration, Grammar",
    'PT62025': "The riches in Common Subjects: Recitation, Hymn, Folksongs, Composer Study, Artist Study",
    'PT72025': "Living Journals: Essential Notebooks for a Charlotte Mason Education",
    'PT82025': "The Blueprint",
    'PT92025': "The Timetable",
    'PT102025': "Developing a Rhytmn: Education is Life"
  },
  GRADE_5: {
    'PT12025': "The Heart of Learning: Cultivating Atmosphere, Discipline, and Life",
    'PT22025C': "The Feast (Form 2)",
    'PT32025': "Know and Tell: The Power of Narration",
    'PT42025': "Wonder and Wisdom: The Importance of Nature Study in Charlotte Mason Education",
    'PT52025': "Language Arts: Copywork, Transcription, Dictation, Oral Narration, Written Narration, Grammar",
    'PT62025': "The riches in Common Subjects: Recitation, Hymn, Folksongs, Composer Study, Artist Study",
    'PT72025': "Living Journals: Essential Notebooks for a Charlotte Mason Education",
    'PT82025': "The Blueprint",
    'PT92025': "The Timetable",
    'PT102025': "Developing a Rhytmn: Education is Life"
  },
  GRADE_6: {
    'PT12025': "The Heart of Learning: Cultivating Atmosphere, Discipline, and Life",
    'PT22025C': "The Feast (Form 2)",
    'PT32025': "Know and Tell: The Power of Narration",
    'PT42025': "Wonder and Wisdom: The Importance of Nature Study in Charlotte Mason Education",
    'PT52025': "Language Arts: Copywork, Transcription, Dictation, Oral Narration, Written Narration, Grammar",
    'PT62025': "The riches in Common Subjects: Recitation, Hymn, Folksongs, Composer Study, Artist Study",
    'PT72025': "Living Journals: Essential Notebooks for a Charlotte Mason Education",
    'PT82025': "The Blueprint",
    'PT92025': "The Timetable",
    'PT102025': "Developing a Rhytmn: Education is Life"
  },
  GRADE_7: {
    'PT12025': "The Heart of Learning: Cultivating Atmosphere, Discipline, and Life",
    'PT22025D': "The Feast (Form 3)",
    'PT32025': "Know and Tell: The Power of Narration",
    'PT42025': "Wonder and Wisdom: The Importance of Nature Study in Charlotte Mason Education",
    'PT62025': "The riches in Common Subjects: Recitation, Hymn, Folksongs, Composer Study, Artist Study",
    'PT72025': "Living Journals: Essential Notebooks for a Charlotte Mason Education",
    'PT82025': "The Blueprint",
    'PT92025': "The Timetable",
    'PT102025': "Developing a Rhytmn: Education is Life"
  },
  GRADE_8: {
    'PT12025': "The Heart of Learning: Cultivating Atmosphere, Discipline, and Life",
    'PT22025D': "The Feast (Form 3)",
    'PT32025': "Know and Tell: The Power of Narration",
    'PT42025': "Wonder and Wisdom: The Importance of Nature Study in Charlotte Mason Education",
    'PT62025': "The riches in Common Subjects: Recitation, Hymn, Folksongs, Composer Study, Artist Study",
    'PT72025': "Living Journals: Essential Notebooks for a Charlotte Mason Education",
    'PT82025': "The Blueprint",
    'PT92025': "The Timetable",
    'PT102025': "Developing a Rhytmn: Education is Life"
  },
  GRADE_9: {
    'PT12025': "The Heart of Learning: Cultivating Atmosphere, Discipline, and Life",
    'PT22025D': "The Feast (Form 3)",
    'PT32025': "Know and Tell: The Power of Narration",
    'PT42025': "Wonder and Wisdom: The Importance of Nature Study in Charlotte Mason Education",
    'PT62025': "The riches in Common Subjects: Recitation, Hymn, Folksongs, Composer Study, Artist Study",
    'PT72025': "Living Journals: Essential Notebooks for a Charlotte Mason Education",
    'PT82025': "The Blueprint",
    'PT92025': "The Timetable",
    'PT102025': "Developing a Rhytmn: Education is Life"
  },
  GRADE_10: {
    'PT12025': "The Heart of Learning: Cultivating Atmosphere, Discipline, and Life",
    'PT22025D': "The Feast (Form 3)",
    'PT32025': "Know and Tell: The Power of Narration",
    'PT42025': "Wonder and Wisdom: The Importance of Nature Study in Charlotte Mason Education",
    'PT62025': "The riches in Common Subjects: Recitation, Hymn, Folksongs, Composer Study, Artist Study",
    'PT72025': "Living Journals: Essential Notebooks for a Charlotte Mason Education",
    'PT82025': "The Blueprint",
    'PT92025': "The Timetable",
    'PT102025': "Developing a Rhytmn: Education is Life"
  },
  GRADE_11: {
  },
  GRADE_12: {
  },
}