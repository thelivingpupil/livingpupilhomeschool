import {
  Accreditation,
  GradeLevel,
  PaymentType,
  Program,
  TransactionSource,
} from '@prisma/client';

import sanityClient from '@/lib/server/sanity';
import prisma from '@/prisma/index';
import {
  ACCREDITATION,
  FEES,
  GRADE_LEVEL,
  GRADE_LEVEL_TYPES,
  PROGRAM,
} from '@/utils/constants';
import { createTransaction } from './transaction';

export const createSchoolFees = async (
  userId,
  email,
  workspaceId,
  payment,
  enrollmentType,
  incomingGradeLevel,
  program,
  cottageType,
  accreditation,
  paymentMethod,
  discountCode = ''
) => {
  let gradeLevel = incomingGradeLevel;

  if (program === Program.HOMESCHOOL_COTTAGE) {
    if (
      [GradeLevel.GRADE_1, GradeLevel.GRADE_2, GradeLevel.GRADE_3].includes(
        incomingGradeLevel
      )
    ) {
      gradeLevel = GRADE_LEVEL_TYPES.FORM_1;
    }

    if (
      [GradeLevel.GRADE_4, GradeLevel.GRADE_5, GradeLevel.GRADE_6].includes(
        incomingGradeLevel
      )
    ) {
      gradeLevel = GRADE_LEVEL_TYPES.FORM_2;
    }

    if (
      [
        GradeLevel.GRADE_7,
        GradeLevel.GRADE_8,
        GradeLevel.GRADE_9,
        GradeLevel.GRADE_10,
      ].includes(incomingGradeLevel)
    ) {
      gradeLevel = GRADE_LEVEL_TYPES.FORM_3;
    }
  }

  const sanityFetchArgs =
    program === Program.HOMESCHOOL_COTTAGE
      ? [
          `*[_type == 'programs' && gradeLevel == $gradeLevel && programType == $program && enrollmentType == $enrollmentType && cottageType == $cottageType][0]{...}`,
          {
            enrollmentType,
            gradeLevel,
            program,
            cottageType,
          },
        ]
      : [
          `*[_type == 'programs' && gradeLevel == $gradeLevel && programType == $program && enrollmentType == $enrollmentType][0]{...}`,
          {
            enrollmentType,
            gradeLevel,
            program,
          },
        ];

  const fetchProgram = await sanityClient.fetch(...sanityFetchArgs);

  const schoolFee = fetchProgram?.tuitionFees.find(
    (tuition) => tuition.type === accreditation
  );

  const description = `${PROGRAM[program]} for ${GRADE_LEVEL[incomingGradeLevel]} - ${ACCREDITATION[accreditation]}`;
  let result = null;

  const discount =
    discountCode &&
    (await sanityClient.fetch(
      `*[_type == 'discounts' && code == $code][0]{...}`,
      { code: discountCode }
    ));

  const isPastorsFee =
    discount && discount?.code?.toLowerCase().includes('pastor');

  if (payment === PaymentType.ANNUAL) {
    const fee = schoolFee.paymentTerms[0];

    const payments = isPastorsFee
      ? discount.value
      : discount
      ? fee.fullPayment -
        (discount.type === 'VALUE'
          ? discount.value
          : (discount.value / 100) * fee.fullPayment)
      : fee.fullPayment;

    const transaction = await prisma.purchaseHistory.create({
      data: { total: payments + FEES[paymentMethod] },
      select: { id: true, transactionId: true },
    });
    const [response] = await Promise.all([
      createTransaction(
        userId,
        email,
        transaction.transactionId,
        payments + FEES[paymentMethod],
        description,
        transaction.id,
        TransactionSource.ENROLLMENT,
        paymentMethod
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
    result = response;
  } else if (payment === PaymentType.SEMI_ANNUAL) {
    const fee = schoolFee.paymentTerms[1];

    const payments = isPastorsFee
      ? [
          fee.downPayment,
          (discount.value - fee.downPayment) / 2,
          (discount.value - fee.downPayment) / 2,
        ]
      : discount
      ? [
          fee.downPayment,
          fee.secondPayment -
            (discount.type === 'VALUE'
              ? discount.value
              : (discount.value / 100) * fee.secondPayment),
          fee.thirdPayment,
        ]
      : [fee.downPayment, fee.secondPayment, fee.thirdPayment];

    const transactionIds = await Promise.all([
      prisma.purchaseHistory.create({
        data: { total: payments[0] + FEES[paymentMethod] },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[1] + FEES[paymentMethod] },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[2] + FEES[paymentMethod] },
        select: { id: true, transactionId: true },
      }),
    ]);
    const [response] = await Promise.all([
      createTransaction(
        userId,
        email,
        transactionIds[0].transactionId,
        payments[0] + FEES[paymentMethod],
        description,
        transactionIds[0].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[1].transactionId,
        payments[1] + FEES[paymentMethod],
        description,
        transactionIds[1].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[2].transactionId,
        payments[2] + FEES[paymentMethod],
        description,
        transactionIds[2].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
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
    result = response;
  } else if (payment === PaymentType.QUARTERLY) {
    const fee = schoolFee.paymentTerms[2];

    const payments = isPastorsFee
      ? [
          fee.downPayment,
          (discount.value - fee.downPayment) / 3,
          (discount.value - fee.downPayment) / 3,
          (discount.value - fee.downPayment) / 3,
        ]
      : discount
      ? [
          fee.downPayment,
          fee.secondPayment -
            (discount.type === 'VALUE'
              ? discount.value
              : (discount.value / 100) * fee.secondPayment),
          fee.thirdPayment,
          fee.fourthPayment,
        ]
      : [
          fee.downPayment,
          fee.secondPayment,
          fee.thirdPayment,
          fee.fourthPayment,
        ];

    const transactionIds = await Promise.all([
      prisma.purchaseHistory.create({
        data: { total: payments[0] + FEES[paymentMethod] },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[1] + FEES[paymentMethod] },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[2] + FEES[paymentMethod] },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[3] + FEES[paymentMethod] },
        select: { id: true, transactionId: true },
      }),
    ]);
    const [response] = await Promise.all([
      createTransaction(
        userId,
        email,
        transactionIds[0].transactionId,
        payments[0] + FEES[paymentMethod],
        description,
        transactionIds[0].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[1].transactionId,
        payments[1] + FEES[paymentMethod],
        description,
        transactionIds[1].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[2].transactionId,
        payments[2] + FEES[paymentMethod],
        description,
        transactionIds[2].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[3].transactionId,
        payments[3] + FEES[paymentMethod],
        description,
        transactionIds[3].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
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
    result = response;
  }

  return result;
};

export const getSchoolFeeByStudentIdAndOrder = async (studentId, order) => {
  try {
    const schoolFees = await prisma.schoolFee.findMany({
      select: {
        transactionId: true,
        order: true,
        transaction:{
          select:{
            transactionId: true,
            amount: true,
            payment: true,
            balance: true,
            paymentStatus: true,
          }
      },
      },
      where: {
        studentId: studentId,
        order: order,
      },
    });

    return schoolFees;
  } catch (error) {
    throw new Error(`Error fetching school fees: ${error.message}`);
  }
};