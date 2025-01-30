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
  monthIndex,
  scholarshipCode = '',
) => {
  console.log("Entering createSchoolFees function...");
  let gradeLevel = incomingGradeLevel;
  const miscellaneousFee = 500;

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
      total = payments + FEES[paymentMethod] + miscellaneousFee - scholarshipValue;
    }
    console.log("Fee: " + total)
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
        payments + FEES[paymentMethod] + miscellaneousFee - scholarshipValue,
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

    const calculatedScholarship = scholarshipValue / 2;
    const calculatedMisc = miscellaneousFee / 2;

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
        payments[1] + FEES[paymentMethod] + calculatedMisc - calculatedScholarship,
        description,
        transactionIds[1].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[2].transactionId,
        payments[2] + FEES[paymentMethod] + calculatedMisc - calculatedScholarship,
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

    const calculatedScholarship = scholarshipValue / 3;
    const calculatedMisc = miscellaneousFee / 3;

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
        data: { total: payments[1] + FEES[paymentMethod] + calculatedMisc - calculatedScholarship },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[2] + FEES[paymentMethod] + calculatedMisc - calculatedScholarship },
        select: { id: true, transactionId: true },
      }),
      prisma.purchaseHistory.create({
        data: { total: payments[3] + FEES[paymentMethod] + calculatedMisc - calculatedScholarship },
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
        payments[1] + FEES[paymentMethod] + calculatedMisc - calculatedScholarship,
        description,
        transactionIds[1].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[2].transactionId,
        payments[2] + FEES[paymentMethod] + calculatedMisc - calculatedScholarship,
        description,
        transactionIds[2].id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
      createTransaction(
        userId,
        email,
        transactionIds[3].transactionId,
        payments[3] + FEES[paymentMethod] + calculatedMisc - calculatedScholarship,
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

    const calculatedScholarship = scholarshipValue / monthIndex;
    const calculatedMisc = miscellaneousFee / monthIndex;

    let payments;
    if (isPastorsFee) {
      const discountedPayment = (discount.value - fee.downPayment) / monthIndex;
      payments = [
        fee.downPayment,
        ...Array(monthIndex).fill(discountedPayment),
      ];
    } else {
      // Calculate total payment before applying discount
      const totalPayment = fee.secondPayment + fee.thirdPayment + fee.fourthPayment + fee.fifthPayment + fee.sixthPayment + fee.seventhPayment + fee.eighthPayment + fee.ninthPayment;

      // Calculate monthly payments
      const monthlyPayment = (totalPayment / monthIndex) - calculatedScholarship;

      // Create payments array with monthly payments
      payments = [
        fee.downPayment,
        ...Array(monthIndex).fill(monthlyPayment),
      ];

      // Apply discount to the second payment
      if (discount) {
        const discountValue = discount.type === 'VALUE'
          ? discount.value
          : (discount.value / 100) * fee.secondPayment;
        payments[1] -= discountValue;
      }
    }

    const purchaseHistoryPromises = payments.map((payment, index) => {
      const total = payment + FEES[paymentMethod] - (index > 0 ? calculatedScholarship : 0); // Apply scholarship only from the second payment onwards
      return prisma.purchaseHistory.create({
        data: { total },
        select: { id: true, transactionId: true },
      });
    });

    const transactionIds = await Promise.all(purchaseHistoryPromises);
    const transactionPromises = transactionIds.map((transaction, index) => {
      const total = payments[index] + calculatedMisc + FEES[paymentMethod] - (index > 0 ? calculatedScholarship : 0); // Apply scholarship only from the second payment onwards
      return createTransaction(
        userId,
        email,
        transaction.transactionId,
        total,
        description,
        transaction.id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      );
    });

    const [responses] = await Promise.all(transactionPromises);

    const schoolFeePromises = transactionIds.map((transaction, index) => {
      return prisma.schoolFee.create({
        data: {
          gradeLevel: incomingGradeLevel,
          order: index,
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
      });
    });
    const schoolFeeResponses = await Promise.all(schoolFeePromises);
    // Log the school fee responses for verification
    result = responses;
  }
  console.log("Exiting createSchoolFees function...")
  return result;
};

export const createPayAllFees = async (
  userId,
  email,
  workspaceId,
  payment,
  incomingGradeLevel,
  paymentMethod,
  amount
) => {
  console.log("Entering createSchoolFees function...");
  let result = null;

  if (payment === PaymentType.PAY_ALL) {

    const transaction = await prisma.purchaseHistory.create({
      data: { total: amount },
      select: { id: true, transactionId: true },
    });
    const [response] = await Promise.all([
      createTransaction(
        userId,
        email,
        transaction.transactionId,
        amount,
        `Pay all fees`,
        transaction.id,
        TransactionSource.ENROLLMENT,
        paymentMethod
      ),
    ]);
    await Promise.all([
      prisma.schoolFee.create({
        data: {
          gradeLevel: incomingGradeLevel,
          order: 10,
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
  }
  console.log("Exiting createSchoolFees function...")
  return result;
}

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
            updatedAt: true,
          }
        },
      },
      where: {
        studentId: studentId,
        order: order,
        deletedAt: null,
      },
    });

    return schoolFees;
  } catch (error) {
    throw new Error(`Error fetching school fees: ${error.message}`);
  }
};

//This is used in the Enrollment Transactions to get the Deadlines
export const getSchoolFees = async () => {
  try {
    const schoolFees = await prisma.schoolFee.findMany({
      select: {
        studentId: true,
        order: true,
        paymentType: true,
        transaction: {
          select: {
            transactionId: true,
            amount: true,
            payment: true,
            balance: true,
            paymentStatus: true,
            updatedAt: true,
          }
        },
      },
      where: {
        deletedAt: null,
      },
    });

    return schoolFees;
  } catch (error) {
    throw new Error(`Error fetching school fees: ${error.message}`);
  }
}