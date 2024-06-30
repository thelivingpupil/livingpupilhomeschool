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
  discountCode = '',
  scholarshipCode = '',
) => {
  console.log("Entering createSchoolFees function...");
  console.log("workspaceId: " + workspaceId)
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

  const scholarship =
    scholarshipCode &&
    (await sanityClient.fetch(
      `*[_type == 'scholarships' && code == $code][0]{...}`,
      { code: scholarshipCode }
    ));

  let scholarshipValue = 0;

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

    scholarshipValue = scholarship ?
      scholarship.type === 'VALUE' ? scholarship.value :
        (scholarship.value / 100) * fee.fullPayment
      : 0;

    let total;

    if (scholarshipCode === 'Full-scholar') {
      total = 0;
    } else {
      total = payments + FEES[paymentMethod] - scholarshipValue;
    }

    if (typeof total !== 'number' || isNaN(total)) {
      throw new Error('Invalid total value');
    }
    const transaction = await prisma.purchaseHistory.create({
      data: { total: total },
      select: { id: true, transactionId: true },
    });
    const [response] = await Promise.all([
      createTransaction(
        userId,
        email,
        transaction.transactionId,
        payments + FEES[paymentMethod] - scholarshipValue,
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

    scholarshipValue = scholarship ?
      scholarship.type === 'VALUE' ? scholarship.value :
        (scholarship.value / 100) * fee.fullPayment
      : 0;

    const calculatedScholarship = scholarshipValue / 2

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
        data: { total: payments[1] + FEES[paymentMethod] - calculatedScholarship },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[2] + FEES[paymentMethod] - calculatedScholarship },
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
        payments[1] + FEES[paymentMethod] - calculatedScholarship,
        description,
        transactionIds[1].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[2].transactionId,
        payments[2] + FEES[paymentMethod] - calculatedScholarship,
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

    scholarshipValue = scholarship ?
      scholarship.type === 'VALUE' ? scholarship.value :
        (scholarship.value / 100) * fee.fullPayment
      : 0;

    const calculatedScholarship = scholarshipValue / 3

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
        data: { total: payments[1] + FEES[paymentMethod] - calculatedScholarship },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[2] + FEES[paymentMethod] - calculatedScholarship },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[3] + FEES[paymentMethod] - calculatedScholarship },
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
        payments[1] + FEES[paymentMethod] - calculatedScholarship,
        description,
        transactionIds[1].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[2].transactionId,
        payments[2] + FEES[paymentMethod] - calculatedScholarship,
        description,
        transactionIds[2].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[3].transactionId,
        payments[3] + FEES[paymentMethod] - calculatedScholarship,
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
  } else if (payment === PaymentType.MONTHLY) {
    const fee = schoolFee.paymentTerms[3];

    scholarshipValue = scholarship ?
      scholarship.type === 'VALUE' ? scholarship.value :
        (scholarship.value / 100) * fee.fullPayment
      : 0;

    const calculatedScholarship = scholarshipValue / 8

    const payments = isPastorsFee
      ? [
        fee.downPayment,
        (discount.value - fee.downPayment) / 8,
        (discount.value - fee.downPayment) / 8,
        (discount.value - fee.downPayment) / 8,
        (discount.value - fee.downPayment) / 8,
        (discount.value - fee.downPayment) / 8,
        (discount.value - fee.downPayment) / 8,
        (discount.value - fee.downPayment) / 8,
        (discount.value - fee.downPayment) / 8,
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
          fee.fifthPayment,
          fee.sixthPayment,
          fee.seventhPayment,
          fee.eighthPayment,
          fee.ninthPayment,
        ]
        : [
          fee.downPayment,
          fee.secondPayment,
          fee.thirdPayment,
          fee.fourthPayment,
          fee.fifthPayment,
          fee.sixthPayment,
          fee.seventhPayment,
          fee.eighthPayment,
          fee.ninthPayment,
        ];
    console.log(payments)
    const transactionIds = await Promise.all([
      prisma.purchaseHistory.create({
        data: { total: payments[0] + FEES[paymentMethod] },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[1] + FEES[paymentMethod] - calculatedScholarship },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[2] + FEES[paymentMethod] - calculatedScholarship },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[3] + FEES[paymentMethod] - calculatedScholarship },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[4] + FEES[paymentMethod] - calculatedScholarship },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[5] + FEES[paymentMethod] - calculatedScholarship },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[6] + FEES[paymentMethod] - calculatedScholarship },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[7] + FEES[paymentMethod] - calculatedScholarship },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[8] + FEES[paymentMethod] - calculatedScholarship },
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
        payments[1] + FEES[paymentMethod] - calculatedScholarship,
        description,
        transactionIds[1].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[2].transactionId,
        payments[2] + FEES[paymentMethod] - calculatedScholarship,
        description,
        transactionIds[2].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[3].transactionId,
        payments[3] + FEES[paymentMethod] - calculatedScholarship,
        description,
        transactionIds[3].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[4].transactionId,
        payments[4] + FEES[paymentMethod] - calculatedScholarship,
        description,
        transactionIds[4].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[5].transactionId,
        payments[5] + FEES[paymentMethod] - calculatedScholarship,
        description,
        transactionIds[5].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[6].transactionId,
        payments[6] + FEES[paymentMethod] - calculatedScholarship,
        description,
        transactionIds[6].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[7].transactionId,
        payments[7] + FEES[paymentMethod] - calculatedScholarship,
        description,
        transactionIds[7].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[8].transactionId,
        payments[8] + FEES[paymentMethod] - calculatedScholarship,
        description,
        transactionIds[8].id,
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
      prisma.schoolFee.create({
        data: {
          gradeLevel: incomingGradeLevel,
          order: 4,
          paymentType: payment,
          transaction: {
            connect: {
              transactionId: transactionIds[4].transactionId,
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
          order: 5,
          paymentType: payment,
          transaction: {
            connect: {
              transactionId: transactionIds[5].transactionId,
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
          order: 6,
          paymentType: payment,
          transaction: {
            connect: {
              transactionId: transactionIds[6].transactionId,
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
          order: 7,
          paymentType: payment,
          transaction: {
            connect: {
              transactionId: transactionIds[7].transactionId,
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
          order: 8,
          paymentType: payment,
          transaction: {
            connect: {
              transactionId: transactionIds[8].transactionId,
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

export const deleteStudentSchoolFees = async (studentId) => {
  try {
    if (studentId === null) {
      throw new Error('Student ID cannot be null');
    }

    await prisma.schoolFee.updateMany({
      data: { deletedAt: new Date() },
      where: { studentId },
    });
  } catch (error) {
    console.error('Error deleting student school fees:', error);
    throw error;
  }
};

export const getSchoolFeeByStudentIdAndOrder = async (studentId, order) => {
  try {
    const schoolFees = await prisma.schoolFee.findMany({
      select: {
        transactionId: true,
        order: true,
        transaction: {
          select: {
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