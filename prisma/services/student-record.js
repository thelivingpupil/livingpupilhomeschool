import prisma from '@/prisma/index';

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
