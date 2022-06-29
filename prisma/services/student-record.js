import { GradeLevel, Program, TransactionStatus } from '@prisma/client';

export const countEnrolledStudentsByGradeLevel = async () => {
  const result = await prisma.studentRecord.groupBy({
    by: ['incomingGradeLevel'],
    where: {
      deletedAt: null,
      student: {
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

export const countEnrolledStudentsByProgram = async () => {
  const result = await prisma.studentRecord.groupBy({
    by: ['program'],
    where: {
      deletedAt: null,
      student: {
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

export const countEnrolledStudents = async () =>
  await prisma.studentRecord.count({
    where: {
      deletedAt: null,
      student: {
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

export const countStudents = async () =>
  await prisma.studentRecord.count({
    where: { deletedAt: null },
  });

export const countStudentsByGradeLevel = async () =>
  await prisma.studentRecord.groupBy({
    by: ['incomingGradeLevel'],
    _count: true,
    where: { deletedAt: null },
  });

export const countStudentsByProgram = async () =>
  await prisma.studentRecord.groupBy({
    by: ['program'],
    _count: true,
    where: { deletedAt: null },
  });

export const createStudentRecord = async (
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
  accreditation,
  reason,
  formerSchoolName,
  formerSchoolAddress
) =>
  await prisma.studentRecord.create({
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
      accreditation,
      reason,
      formerSchoolName,
      formerSchoolAddress,
    },
  });

export const getStudentRecords = async () =>
  await prisma.studentRecord.findMany({
    orderBy: [{ createdAt: 'desc' }],
    select: {
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
      reason: true,
      formerSchoolName: true,
      formerSchoolAddress: true,
      student: {
        select: {
          creator: {
            select: {
              guardianInformation: true,
            },
          },
        },
      },
    },
    where: { deletedAt: null },
  });
