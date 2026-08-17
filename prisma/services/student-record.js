import { GradeLevel, Program, TransactionStatus } from '@prisma/client';
import prisma from '@/prisma/index';

export const countEnrolledStudentsByGradeLevel = async (startDate, endDate) => {
  const filterDate =
    startDate && endDate
      ? {
          AND: [
            { createdAt: { gte: new Date(startDate) } },
            { createdAt: { lte: new Date(endDate) } },
          ],
        }
      : {};
  const result = await prisma.studentRecord.groupBy({
    by: ['incomingGradeLevel'],
    where: {
      ...filterDate,
      deletedAt: null,
      student: {
        deletedAt: null,
        schoolFees: {
          some: {
            transaction: {
              paymentStatus: TransactionStatus.S,
            },
          },
        },
      },
    },
    _count: { incomingGradeLevel: true },
  });
  const data = {
    [GradeLevel.PRESCHOOL]: 0,
    [GradeLevel.K1]: 0,
    [GradeLevel.K2]: 0,
    [GradeLevel.GRADE_1]: 0,
    [GradeLevel.GRADE_2]: 0,
    [GradeLevel.GRADE_3]: 0,
    [GradeLevel.GRADE_4]: 0,
    [GradeLevel.GRADE_5]: 0,
    [GradeLevel.GRADE_6]: 0,
    [GradeLevel.GRADE_7]: 0,
    [GradeLevel.GRADE_8]: 0,
    [GradeLevel.GRADE_9]: 0,
    [GradeLevel.GRADE_10]: 0,
    [GradeLevel.GRADE_11]: 0,
    [GradeLevel.GRADE_12]: 0,
  };
  result.forEach((level) => {
    data[level.incomingGradeLevel] = level._count.incomingGradeLevel;
  });
  return data;
};

export const countUsedDiscountCode = async (code) =>
  await prisma.studentRecord.count({ where: { discount: code } });

export const countEnrolledStudentsByProgram = async (startDate, endDate) => {
  const filterDate =
    startDate && endDate
      ? {
          AND: [
            { createdAt: { gte: new Date(startDate) } },
            { createdAt: { lte: new Date(endDate) } },
          ],
        }
      : {};
  const result = await prisma.studentRecord.groupBy({
    by: ['program'],
    where: {
      ...filterDate,
      deletedAt: null,
      student: {
        deletedAt: null,
        schoolFees: {
          some: {
            transaction: {
              paymentStatus: TransactionStatus.S,
            },
          },
        },
      },
    },
    _count: { program: true },
  });
  const data = {
    [Program.HOMESCHOOL_COTTAGE]: 0,
    [Program.HOMESCHOOL_PROGRAM]: 0,
  };
  result.forEach((level) => {
    data[level.program] = level._count.program;
  });
  return data;
};

export const countEnrolledStudents = async (startDate, endDate) => {
  const filterDate =
    startDate && endDate
      ? {
          AND: [
            { createdAt: { gte: new Date(startDate) } },
            { createdAt: { lte: new Date(endDate) } },
          ],
        }
      : {};
  return await prisma.studentRecord.count({
    where: {
      ...filterDate,
      deletedAt: null,
      student: {
        deletedAt: null,
        schoolFees: {
          some: {
            transaction: {
              paymentStatus: TransactionStatus.S,
            },
          },
        },
      },
    },
  });
};

export const countStudents = async (startDate, endDate) => {
  const filterDate =
    startDate && endDate
      ? {
          AND: [
            { createdAt: { gte: new Date(startDate) } },
            { createdAt: { lte: new Date(endDate) } },
          ],
        }
      : {};

  return await prisma.studentRecord.count({
    where: {
      ...filterDate,
      deletedAt: null,
      student: { deletedAt: null },
    },
  });
};

export const countStudentsByGradeLevel = async () =>
  await prisma.studentRecord.groupBy({
    by: ['incomingGradeLevel'],
    _count: true,
    where: { deletedAt: null, student: { deletedAt: null } },
  });

export const countStudentsByProgram = async () =>
  await prisma.studentRecord.groupBy({
    by: ['program'],
    _count: true,
    where: { deletedAt: null, student: { deletedAt: null } },
  });

const isDbClient = (value) =>
  Boolean(
    value &&
      typeof value === 'object' &&
      (typeof value.$queryRaw === 'function' ||
        typeof value.studentRecord?.create === 'function' ||
        typeof value.cottageSlot?.updateMany === 'function')
  );

const getStudentRecordClient = (client) => {
  if (client == null) {
    return prisma;
  }

  if (isDbClient(client)) {
    return client;
  }

  if (isDbClient(client.default)) {
    return client.default;
  }

  return prisma;
};

const recordFromPositional = (values) => {
  const [
    id,
    firstName,
    middleName,
    lastName,
    birthDate,
    gender,
    religion,
    incomingGradeLevel,
    enrollmentType,
    program,
    cottageType,
    accreditation,
    schoolYear,
    reason,
    formerSchoolName,
    formerSchoolAddress,
    image,
    liveBirthCertificate,
    reportCard,
    discount,
    primaryTeacherName,
    primaryTeacherAge,
    primaryTeacherRelationship,
    primaryTeacherEducation,
    primaryTeacherProfile,
    studentStatus,
    signature,
    specialNeeds,
    specialNeedSpecific,
    formerRegistrar,
    formerRegistrarEmail,
    formerRegistrarNumber,
    studentAddress1,
    studentAddress2,
    isInternationalAddress,
    studentInternationalAddress,
    mediaConsent,
    enrollmentAgreementSignature,
    enrollmentAgreementSignatureDate,
    maybeCottageSlotOrPreviousSchoolType,
    maybeGapYearAgreement,
    maybeLrnProvisionForm,
    maybeCottageSlotId,
  ] = values;

  const hasDocFields = values.length >= 43;

  return {
    id,
    firstName,
    middleName,
    lastName,
    birthDate,
    gender,
    religion,
    incomingGradeLevel,
    enrollmentType,
    program,
    cottageType,
    accreditation,
    schoolYear,
    reason,
    formerSchoolName,
    formerSchoolAddress,
    image,
    liveBirthCertificate,
    reportCard,
    discount,
    primaryTeacherName,
    primaryTeacherAge,
    primaryTeacherRelationship,
    primaryTeacherEducation,
    primaryTeacherProfile,
    studentStatus,
    signature,
    specialNeeds,
    specialNeedSpecific,
    formerRegistrar,
    formerRegistrarEmail,
    formerRegistrarNumber,
    studentAddress1,
    studentAddress2,
    isInternationalAddress,
    studentInternationalAddress,
    mediaConsent,
    enrollmentAgreementSignature,
    enrollmentAgreementSignatureDate,
    previousSchoolType: hasDocFields ? maybeCottageSlotOrPreviousSchoolType : null,
    gapYearAgreement: hasDocFields ? maybeGapYearAgreement : null,
    lrnProvisionForm: hasDocFields ? maybeLrnProvisionForm : null,
    cottageSlotId: hasDocFields
      ? maybeCottageSlotId
      : maybeCottageSlotOrPreviousSchoolType,
  };
};

export const createStudentRecord = async (...args) => {
  let client;
  const last = args[args.length - 1];

  if (isDbClient(last) || last == null) {
    client = args.pop();
  } else if (
    args.length > 1 &&
    last &&
    typeof last === 'object' &&
    !Array.isArray(last) &&
    !('firstName' in last)
  ) {
    client = args.pop();
  }

  const first = args[0];
  const record =
    args.length === 1 && first && typeof first === 'object' && !Array.isArray(first)
      ? first
      : recordFromPositional(args);

  const db = getStudentRecordClient(client);
  const {
    id,
    firstName,
    middleName,
    lastName,
    birthDate,
    gender,
    religion,
    incomingGradeLevel,
    enrollmentType,
    program,
    cottageType,
    accreditation,
    schoolYear,
    reason,
    formerSchoolName,
    formerSchoolAddress,
    image,
    liveBirthCertificate,
    reportCard,
    discount,
    primaryTeacherName,
    primaryTeacherAge,
    primaryTeacherRelationship,
    primaryTeacherEducation,
    primaryTeacherProfile,
    studentStatus,
    signature,
    specialNeeds,
    specialNeedSpecific,
    formerRegistrar,
    formerRegistrarEmail,
    formerRegistrarNumber,
    studentAddress1,
    studentAddress2,
    isInternationalAddress,
    studentInternationalAddress,
    mediaConsent,
    enrollmentAgreementSignature,
    enrollmentAgreementSignatureDate,
    previousSchoolType = null,
    gapYearAgreement = null,
    lrnProvisionForm = null,
    cottageSlotId = null,
  } = record;

  return db.studentRecord.create({
    data: {
      studentId: id,
      firstName,
      middleName,
      lastName,
      birthDate,
      gender,
      religion,
      incomingGradeLevel,
      enrollmentType,
      program,
      cottageType,
      cottageSlotId,
      accreditation,
      schoolYear,
      reason,
      formerSchoolName,
      formerSchoolAddress,
      image,
      liveBirthCertificate,
      reportCard,
      previousSchoolType,
      gapYearAgreement,
      lrnProvisionForm,
      discount,
      primaryTeacherName,
      primaryTeacherAge,
      primaryTeacherRelationship,
      primaryTeacherEducation,
      primaryTeacherProfile,
      studentStatus,
      signature,
      specialNeeds,
      specialNeedSpecific,
      formerRegistrar,
      formerRegistrarEmail,
      formerRegistrarNumber,
      studentAddress1,
      studentAddress2,
      isInternationalAddress,
      studentInternationalAddress,
      mediaConsent,
      enrollmentAgreementSignature,
      enrollmentAgreementSignatureDate,
    },
  });
};

export const updateFile = async (studentId, type, url) => {
  let data = {};

  switch (type) {
    case 'image': {
      data.image = url;
      break;
    }
    case 'birth': {
      data.liveBirthCertificate = url;
      break;
    }
    case 'card': {
      data.reportCard = url;
      break;
    }
    case 'schoolYearReportCard': {
      data.schoolYearReportCard = url;
      break;
    }
    case 'gapYear': {
      data.gapYearAgreement = url;
      break;
    }
    case 'lrnForm': {
      data.lrnProvisionForm = url;
      break;
    }
    case 'idPictureFront': {
      data.idPictureFront = url;
      break;
    }
    case 'idPictureBack': {
      data.idPictureBack = url;
      break;
    }
    default:
      return;
  }

  await prisma.studentRecord.update({
    data,
    where: { studentId },
  });
};

export const getStudentRecords = async () =>
  await prisma.studentRecord.findMany({
    orderBy: [{ createdAt: 'desc' }],
    select: {
      id: true,
      studentId: true,
      firstName: true,
      middleName: true,
      lastName: true,
      birthDate: true,
      gender: true,
      religion: true,
      incomingGradeLevel: true,
      enrollmentType: true,
      program: true,
      accreditation: true,
      partnerSchool: true,
      schoolYear: true,
      reason: true,
      formerSchoolName: true,
      formerSchoolAddress: true,
      image: true,
      liveBirthCertificate: true,
      reportCard: true,
      schoolYearReportCard: true,
      previousSchoolType: true,
      gapYearAgreement: true,
      lrnProvisionForm: true,
      idPictureFront: true,
      idPictureBack: true,
      discount: true,
      studentStatus: true,
      cottageType: true,
      studentAddress1: true,
      studentAddress2: true,
      student: {
        select: {
          creator: {
            select: {
              email: true,
              guardianInformation: true,
            },
          },
          schoolFees: {
            select: {
              order: true,
              paymentType: true,
              deletedAt: true,
              transaction: {
                select: {
                  transactionId: true,
                  transactionStatus: true,
                  amount: true,
                  paymentReference: true,
                  paymentStatus: true,
                  message: true,
                  referenceNumber: true,
                  url: true,
                  updatedAt: true,
                  description: true,
                  source: true,
                },
              },
            },
            where: {
              deletedAt: null, // Filter out schoolFees where deletedAt is not null
            },
            orderBy: [{ order: 'asc' }],
          },
        },
      },
    },
    where: {
      deletedAt: null,
      // student: {
      //   deletedAt: null,
      //   schoolFees: {
      //     some: {
      //       transaction: {
      //         paymentStatus: TransactionStatus.S,
      //       },
      //     },
      //   },
      // },
    },
  });

export const getEnrolledStudentRecords = async () =>
  await prisma.studentRecord.findMany({
    orderBy: [{ createdAt: 'desc' }],
    select: {
      id: true,
      studentId: true,
      firstName: true,
      middleName: true,
      lastName: true,
      birthDate: true,
      gender: true,
      religion: true,
      incomingGradeLevel: true,
      enrollmentType: true,
      program: true,
      accreditation: true,
      schoolYear: true,
      reason: true,
      formerSchoolName: true,
      formerSchoolAddress: true,
      image: true,
      liveBirthCertificate: true,
      reportCard: true,
      schoolYearReportCard: true,
      previousSchoolType: true,
      gapYearAgreement: true,
      lrnProvisionForm: true,
      idPictureFront: true,
      idPictureBack: true,
      discount: true,
      studentStatus: true,
      cottageType: true,
      studentAddress1: true,
      studentAddress2: true,
      student: {
        select: {
          creator: {
            select: {
              email: true,
              guardianInformation: true,
            },
          },
          schoolFees: {
            select: {
              order: true,
              paymentType: true,
              deletedAt: true,
              transaction: {
                select: {
                  transactionId: true,
                  transactionStatus: true,
                  amount: true,
                  paymentReference: true,
                  paymentStatus: true,
                  message: true,
                  referenceNumber: true,
                  url: true,
                  updatedAt: true,
                },
              },
            },
            where: {
              deletedAt: null, // Filter out schoolFees where deletedAt is not null
            },
            orderBy: [{ order: 'asc' }],
          },
        },
      },
    },
    where: {
      deletedAt: null,
      schoolYear: '2024-2025',
      student: {
        deletedAt: null,
        schoolFees: {
          some: {
            transaction: {
              paymentStatus: TransactionStatus.S,
            },
          },
        },
      },
    },
  });

export const getStudentRecord = async (id) =>
  await prisma.studentRecord.findUnique({
    select: {
      id: true,
      studentId: true,
      firstName: true,
      middleName: true,
      lastName: true,
      birthDate: true,
      gender: true,
      religion: true,
      incomingGradeLevel: true,
      enrollmentType: true,
      program: true,
      accreditation: true,
      schoolYear: true,
      reason: true,
      formerSchoolName: true,
      formerSchoolAddress: true,
      image: true,
      liveBirthCertificate: true,
      reportCard: true,
      schoolYearReportCard: true,
      previousSchoolType: true,
      gapYearAgreement: true,
      lrnProvisionForm: true,
      idPictureFront: true,
      idPictureBack: true,
      discount: true,
      scholarship: true,
    },
    where: {
      studentId: id,
    },
  });

export const deleteStudentRecord = async (studentId) =>
  await prisma.studentRecord.update({
    data: { deletedAt: new Date() },
    where: { studentId },
  });

export const updateStudentRecord = async (studentId, studentNewData) =>
  await prisma.studentRecord.update({
    data: {
      firstName: studentNewData.firstName,
      middleName: studentNewData.middleName,
      lastName: studentNewData.lastName,
      gender: studentNewData.gender,
      religion: studentNewData.religion,
      enrollmentType: studentNewData.enrollmentType,
      incomingGradeLevel: studentNewData.incomingGradeLevel,
      schoolYear: studentNewData.schoolYear,
      birthDate: studentNewData.birthDate,
      image: studentNewData.pictureLink,
      liveBirthCertificate: studentNewData.birthCertificateLink,
      reportCard: studentNewData.reportCardLink,
      previousSchoolType: studentNewData.previousSchoolType || null,
      gapYearAgreement: studentNewData.gapYearAgreementLink,
      lrnProvisionForm: studentNewData.lrnProvisionFormLink,
      discount: studentNewData.discountCode,
      accreditation: studentNewData.accreditation,
      partnerSchool: studentNewData.partnerSchool || null,
      scholarship: studentNewData.scholarshipCode,
      idPictureFront: studentNewData.idPictureFront,
      idPictureBack: studentNewData.idPictureBack,
    },
    where: { studentId },
  });

export const updateStudentStatus = async (studentId, newStudentStatus) =>
  await prisma.studentRecord.update({
    data: {
      studentStatus: newStudentStatus,
    },
    where: { studentId },
  });

export const updateStudentRecordForSchoolFees = async (
  studentId,
  newgradeLevel,
  newEnrollmentType,
  newAccreditation,
  newDiscountCode,
  newScholarshipCode,
  newProgram,
  newCottageType
) =>
  await prisma.studentRecord.update({
    data: {
      incomingGradeLevel: newgradeLevel,
      enrollmentType: newEnrollmentType,
      accreditation: newAccreditation,
      discount: newDiscountCode,
      scholarship: newScholarshipCode,
      cottageType: newCottageType,
      program: newProgram,
    },
    where: { studentId },
  });
