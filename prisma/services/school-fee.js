import {
  Accreditation,
  GradeLevel,
  PaymentType,
  Program,
  TransactionSource,
} from '@prisma/client';

import sanityClient from '@/lib/server/sanity';
import prisma from '@/prisma/index';
import { ACCREDITATION, GRADE_LEVEL, PROGRAM } from '@/utils/constants';
import { createTransaction } from './transaction';

export const createSchoolFees = async (
  userId,
  email,
  workspaceId,
  payment,
  enrollmentType,
  incomingGradeLevel,
  program,
  accreditation
) => {
  let gradeLevel = incomingGradeLevel;

  if (program === Program.HOMESCHOOL_PROGRAM) {
    if (
      incomingGradeLevel === GradeLevel.GRADE_1 ||
      incomingGradeLevel === GradeLevel.GRADE_2 ||
      incomingGradeLevel === GradeLevel.GRADE_3 ||
      incomingGradeLevel === GradeLevel.GRADE_4 ||
      incomingGradeLevel === GradeLevel.GRADE_5 ||
      incomingGradeLevel === GradeLevel.GRADE_6
    ) {
      gradeLevel = GradeLevel.GRADE_6;
    } else if (
      incomingGradeLevel === GradeLevel.GRADE_7 ||
      incomingGradeLevel === GradeLevel.GRADE_8 ||
      incomingGradeLevel === GradeLevel.GRADE_9 ||
      incomingGradeLevel === GradeLevel.GRADE_10
    ) {
      gradeLevel = GradeLevel.GRADE_10;
    } else if (
      incomingGradeLevel === GradeLevel.GRADE_11 ||
      incomingGradeLevel === GradeLevel.GRADE_12
    ) {
      gradeLevel = GradeLevel.GRADE_12;
    }
  } else if (program === Program.HOMESCHOOL_COTTAGE) {
    if (
      accreditation === Accreditation.FORM_ONE &&
      (incomingGradeLevel === GradeLevel.GRADE_1 ||
        incomingGradeLevel === GradeLevel.GRADE_2 ||
        incomingGradeLevel === GradeLevel.GRADE_3)
    ) {
      gradeLevel = GradeLevel.GRADE_3;
    } else if (
      accreditation === Accreditation.FORM_TWO &&
      (incomingGradeLevel === GradeLevel.GRADE_4 ||
        incomingGradeLevel === GradeLevel.GRADE_5 ||
        incomingGradeLevel === GradeLevel.GRADE_6)
    ) {
      gradeLevel = GradeLevel.GRADE_6;
    }
  }
  const schoolFee = await sanityClient.fetch(
    `*[_type == 'schoolFees' && gradeLevel == $gradeLevel && accreditation == $accreditation && program == $program && type == $type][0]{...}`,
    {
      accreditation,
      type: enrollmentType,
      gradeLevel,
      program,
    }
  );
  const description = `${PROGRAM[program]} for ${GRADE_LEVEL[incomingGradeLevel]} - ${ACCREDITATION[accreditation]}`;

  if (payment === PaymentType.ANNUAL) {
    const fee = schoolFee.fees[0];
    const transaction = await prisma.purchaseHistory.create({
      data: { total: fee.totalFee },
      select: { id: true, transactionId: true },
    });
    await Promise.all([
      createTransaction(
        userId,
        email,
        transaction.transactionId,
        fee.totalFee,
        description,
        transaction.id,
        TransactionSource.ENROLLMENT
      ),
    ]);
    await Promise.all([
      prisma.schoolFee.create({
        data: {
          gradeLevel: incomingGradeLevel,
          order: 0,
          paymentType: payment,
          transaction: {
            connect: {
              transactionId: transaction.transactionId,
            },
          },
          student: {
            connect: {
              id: workspaceId,
            },
          },
        },
      }),
    ]);
  } else if (payment === PaymentType.SEMI_ANNUAL) {
    const fee = schoolFee.fees[1];
    const transactionIds = await Promise.all([
      prisma.purchaseHistory.create({
        data: { total: fee.initialFee },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: fee.semiAnnualFee },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: fee.semiAnnualFee },
        select: { id: true, transactionId: true },
      }),
    ]);
    await Promise.all([
      createTransaction(
        userId,
        email,
        transactionIds[0].transactionId,
        fee.initialFee,
        description,
        transactionIds[0].id,
        TransactionSource.ENROLLMENT
      ),
      createTransaction(
        userId,
        email,
        transactionIds[1].transactionId,
        fee.semiAnnualFee,
        description,
        transactionIds[1].id,
        TransactionSource.ENROLLMENT
      ),
      createTransaction(
        userId,
        email,
        transactionIds[2].transactionId,
        fee.semiAnnualFee,
        description,
        transactionIds[2].id,
        TransactionSource.ENROLLMENT
      ),
    ]);
    await Promise.all([
      prisma.schoolFee.create({
        data: {
          gradeLevel: incomingGradeLevel,
          order: 0,
          paymentType: payment,
          transaction: {
            connect: {
              transactionId: transactionIds[0].transactionId,
            },
          },
          student: {
            connect: {
              id: workspaceId,
            },
          },
        },
      }),
      prisma.schoolFee.create({
        data: {
          gradeLevel: incomingGradeLevel,
          order: 1,
          paymentType: payment,
          transaction: {
            connect: {
              transactionId: transactionIds[1].transactionId,
            },
          },
          student: {
            connect: {
              id: workspaceId,
            },
          },
        },
      }),
      prisma.schoolFee.create({
        data: {
          gradeLevel: incomingGradeLevel,
          order: 2,
          paymentType: payment,
          transaction: {
            connect: {
              transactionId: transactionIds[2].transactionId,
            },
          },
          student: {
            connect: {
              id: workspaceId,
            },
          },
        },
      }),
    ]);
  } else if (payment === PaymentType.QUARTERLY) {
    const fee = schoolFee.fees[2];
    const transactionIds = await Promise.all([
      prisma.purchaseHistory.create({
        data: { total: fee.initialFee },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: fee.quarterlyFee },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: fee.quarterlyFee },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: fee.quarterlyFee },
        select: { id: true, transactionId: true },
      }),
    ]);
    await Promise.all([
      createTransaction(
        userId,
        email,
        transactionIds[0].transactionId,
        fee.initialFee,
        description,
        transactionIds[0].id,
        TransactionSource.ENROLLMENT
      ),
      createTransaction(
        userId,
        email,
        transactionIds[1].transactionId,
        fee.quarterlyFee,
        description,
        transactionIds[1].id,
        TransactionSource.ENROLLMENT
      ),
      createTransaction(
        userId,
        email,
        transactionIds[2].transactionId,
        fee.quarterlyFee,
        description,
        transactionIds[2].id,
        TransactionSource.ENROLLMENT
      ),
      createTransaction(
        userId,
        email,
        transactionIds[3].transactionId,
        fee.quarterlyFee,
        description,
        transactionIds[3].id,
        TransactionSource.ENROLLMENT
      ),
    ]);
    await Promise.all([
      prisma.schoolFee.create({
        data: {
          gradeLevel: incomingGradeLevel,
          order: 0,
          paymentType: payment,
          transaction: {
            connect: {
              transactionId: transactionIds[0].transactionId,
            },
          },
          student: {
            connect: {
              id: workspaceId,
            },
          },
        },
      }),
      prisma.schoolFee.create({
        data: {
          gradeLevel: incomingGradeLevel,
          order: 1,
          paymentType: payment,
          transaction: {
            connect: {
              transactionId: transactionIds[1].transactionId,
            },
          },
          student: {
            connect: {
              id: workspaceId,
            },
          },
        },
      }),
      prisma.schoolFee.create({
        data: {
          gradeLevel: incomingGradeLevel,
          order: 2,
          paymentType: payment,
          transaction: {
            connect: {
              transactionId: transactionIds[2].transactionId,
            },
          },
          student: {
            connect: {
              id: workspaceId,
            },
          },
        },
      }),
      prisma.schoolFee.create({
        data: {
          gradeLevel: incomingGradeLevel,
          order: 3,
          paymentType: payment,
          transaction: {
            connect: {
              transactionId: transactionIds[3].transactionId,
            },
          },
          student: {
            connect: {
              id: workspaceId,
            },
          },
        },
      }),
    ]);
  }
};
