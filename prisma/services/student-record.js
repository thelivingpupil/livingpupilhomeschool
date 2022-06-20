// import prisma from '@/prisma/index';
import { PrismaClient, TransactionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const countEnrolledStudents = async () =>
  await prisma.studentRecord.count({
    where: {
      deletedAt: null,
      student: {
        deletedAt: null,
        schoolFees: {
          every: {
            transaction: {
              deletedAt: null,
              transactionStatus: TransactionStatus.S,
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
