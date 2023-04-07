import {
  PaymentType,
  TransactionSource,
  TransactionStatus,
  Fees,
} from '@prisma/client';
import { validateSession } from '@/config/api-validation';
import prisma from '@/prisma/index';
import { createStudentRecord } from '@/prisma/services/student-record';
import { createWorkspaceWithSlug } from '@/prisma/services/workspace';
import { ACCREDITATION, GRADE_LEVEL, PROGRAM } from '@/utils/constants';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

const handler = async (req, res) => {
  try {
    const { body } = req;

    const student = JSON.parse(body);

    console.log('student', student);

    const createSchoolFeesInImport = async ({
      program,
      payment,
      initialPayment,
      initialPaymentPending,
      secondPayment,
      secondPaymentPending,
      thirdPayment,
      thirdPaymentPending,
      fourthPayment,
      fourthPaymentPending,
      userId,
      incomingGradeLevel,
      accreditation,
      workspaceId,
    }) => {
      const description = `${PROGRAM[program]} for ${GRADE_LEVEL[incomingGradeLevel]} - ${ACCREDITATION[accreditation]}`;

      if (payment === PaymentType.ANNUAL) {
        const transaction = await prisma.purchaseHistory.create({
          data: { total: initialPayment || initialPaymentPending },
          select: { id: true, transactionId: true },
        });

        await prisma.transaction.create({
          data: {
            transactionId: transaction.transactionId,
            referenceNumber: `fromImport-${uuidv4()}`,
            amount: initialPayment || initialPaymentPending,
            transactionStatus: initialPayment
              ? TransactionStatus.S
              : TransactionStatus.P,
            paymentStatus: initialPayment
              ? TransactionStatus.S
              : TransactionStatus.P,
            source: TransactionSource.ENROLLMENT,
            description,
            fee: Fees.OTC,
            user: {
              connect: {
                id: userId,
              },
            },
            purchaseHistory: {
              connect: {
                id: transaction.id,
              },
            },
          },
        });

        return await Promise.all([
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
      }

      if (payment === PaymentType.SEMI_ANNUAL) {
        const transactions = await Promise.all([
          prisma.purchaseHistory.create({
            data: { total: initialPayment || initialPaymentPending },
            select: { id: true, transactionId: true },
          }),
          prisma.purchaseHistory.create({
            data: { total: secondPayment || secondPaymentPending },
            select: { id: true, transactionId: true },
          }),
          prisma.purchaseHistory.create({
            data: { total: thirdPayment || thirdPaymentPending },
            select: { id: true, transactionId: true },
          }),
        ]);

        await Promise.all([
          prisma.transaction.create({
            data: {
              transactionId: transactions[0].transactionId,
              referenceNumber: `fromImport-${uuidv4()}`,
              amount: initialPayment || initialPaymentPending,
              transactionStatus: initialPayment
                ? TransactionStatus.S
                : TransactionStatus.P,
              paymentStatus: initialPayment
                ? TransactionStatus.S
                : TransactionStatus.P,
              source: TransactionSource.ENROLLMENT,
              description,
              fee: Fees.OTC,
              user: {
                connect: {
                  id: userId,
                },
              },
              purchaseHistory: {
                connect: {
                  id: transactions[0].id,
                },
              },
            },
          }),
          prisma.transaction.create({
            data: {
              transactionId: transactions[1].transactionId,
              referenceNumber: `fromImport-${uuidv4()}`,
              amount: secondPayment || secondPaymentPending,
              transactionStatus: secondPayment
                ? TransactionStatus.S
                : TransactionStatus.P,
              paymentStatus: secondPayment
                ? TransactionStatus.S
                : TransactionStatus.P,
              source: TransactionSource.ENROLLMENT,
              description,
              fee: Fees.OTC,
              user: {
                connect: {
                  id: userId,
                },
              },
              purchaseHistory: {
                connect: {
                  id: transactions[1].id,
                },
              },
            },
          }),
          prisma.transaction.create({
            data: {
              transactionId: transactions[2].transactionId,
              referenceNumber: `fromImport-${uuidv4()}`,
              amount: thirdPayment || thirdPaymentPending,
              transactionStatus: thirdPayment
                ? TransactionStatus.S
                : TransactionStatus.P,
              paymentStatus: thirdPayment
                ? TransactionStatus.S
                : TransactionStatus.P,
              source: TransactionSource.ENROLLMENT,
              description,
              fee: Fees.OTC,
              user: {
                connect: {
                  id: userId,
                },
              },
              purchaseHistory: {
                connect: {
                  id: transactions[2].id,
                },
              },
            },
          }),
        ]);

        return await Promise.all([
          prisma.schoolFee.create({
            data: {
              gradeLevel: incomingGradeLevel,
              order: 0,
              paymentType: payment,
              transaction: {
                connect: {
                  transactionId: transactions[0].transactionId,
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
                  transactionId: transactions[1].transactionId,
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
                  transactionId: transactions[2].transactionId,
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

      if (payment === PaymentType.QUARTERLY) {
        const transactions = await Promise.all([
          prisma.purchaseHistory.create({
            data: { total: initialPayment || initialPaymentPending },
            select: { id: true, transactionId: true },
          }),
          prisma.purchaseHistory.create({
            data: { total: secondPayment || secondPaymentPending },
            select: { id: true, transactionId: true },
          }),
          prisma.purchaseHistory.create({
            data: { total: thirdPayment || thirdPaymentPending },
            select: { id: true, transactionId: true },
          }),
          prisma.purchaseHistory.create({
            data: { total: fourthPayment || fourthPaymentPending },
            select: { id: true, transactionId: true },
          }),
        ]);

        await Promise.all([
          prisma.transaction.create({
            data: {
              transactionId: transactions[0].transactionId,
              referenceNumber: `fromImport-${uuidv4()}`,
              amount: initialPayment || initialPaymentPending,
              transactionStatus: initialPayment
                ? TransactionStatus.S
                : TransactionStatus.P,
              paymentStatus: initialPayment
                ? TransactionStatus.S
                : TransactionStatus.P,
              source: TransactionSource.ENROLLMENT,
              description,
              fee: Fees.OTC,
              user: {
                connect: {
                  id: userId,
                },
              },
              purchaseHistory: {
                connect: {
                  id: transactions[0].id,
                },
              },
            },
          }),
          prisma.transaction.create({
            data: {
              transactionId: transactions[1].transactionId,
              referenceNumber: `fromImport-${uuidv4()}`,
              amount: secondPayment || secondPaymentPending,
              transactionStatus: secondPayment
                ? TransactionStatus.S
                : TransactionStatus.P,
              paymentStatus: secondPayment
                ? TransactionStatus.S
                : TransactionStatus.P,
              source: TransactionSource.ENROLLMENT,
              description,
              fee: Fees.OTC,
              user: {
                connect: {
                  id: userId,
                },
              },
              purchaseHistory: {
                connect: {
                  id: transactions[1].id,
                },
              },
            },
          }),
          prisma.transaction.create({
            data: {
              transactionId: transactions[2].transactionId,
              referenceNumber: `fromImport-${uuidv4()}`,
              amount: thirdPayment || thirdPaymentPending,
              transactionStatus: thirdPayment
                ? TransactionStatus.S
                : TransactionStatus.P,
              paymentStatus: thirdPayment
                ? TransactionStatus.S
                : TransactionStatus.P,
              source: TransactionSource.ENROLLMENT,
              description,
              fee: Fees.OTC,
              user: {
                connect: {
                  id: userId,
                },
              },
              purchaseHistory: {
                connect: {
                  id: transactions[2].id,
                },
              },
            },
          }),
          prisma.transaction.create({
            data: {
              transactionId: transactions[3].transactionId,
              referenceNumber: `fromImport-${uuidv4()}`,
              amount: fourthPayment || fourthPaymentPending,
              transactionStatus: fourthPayment
                ? TransactionStatus.S
                : TransactionStatus.P,
              paymentStatus: fourthPayment
                ? TransactionStatus.S
                : TransactionStatus.P,
              source: TransactionSource.ENROLLMENT,
              description,
              fee: Fees.OTC,
              user: {
                connect: {
                  id: userId,
                },
              },
              purchaseHistory: {
                connect: {
                  id: transactions[3].id,
                },
              },
            },
          }),
        ]);

        return await Promise.all([
          prisma.schoolFee.create({
            data: {
              gradeLevel: incomingGradeLevel,
              order: 0,
              paymentType: payment,
              transaction: {
                connect: {
                  transactionId: transactions[0].transactionId,
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
                  transactionId: transactions[1].transactionId,
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
                  transactionId: transactions[2].transactionId,
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
                  transactionId: transactions[3].transactionId,
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

    const processUser = async ({ email, firstName, lastName }) => {
      const session = await validateSession(req, res);

      const user = await prisma.user.findUnique({
        select: {
          id: true,
          email: true,
          name: true,
          userCode: true,
          createdWorkspace: true,
        },
        where: { email },
      });

      console.log('user', user);

      const activeUser =
        user ??
        (await prisma.user.findUnique({
          select: {
            id: true,
            email: true,
            name: true,
            userCode: true,
            createdWorkspace: {
              select: {
                id: true,
                workspaceCode: true,
                inviteCode: true,
                creatorId: true,
                name: true,
                slug: true,
                schoolFees: true,
                studentRecord: true,
              },
            },
          },
          where: { id: session.user.userId },
        }));

      console.log('activeUser', activeUser);

      const existingWorkspace = activeUser.createdWorkspace.find(
        (workspace) => {
          const validation =
            workspace.name.length > firstName.length
              ? {
                  compareWith: workspace.name.toLowerCase(),
                  compareTo: firstName.toLowerCase(),
                }
              : {
                  compareWith: firstName.toLowerCase(),
                  compareTo: workspace.name.toLowerCase(),
                };

          return validation.compareWith.includes(validation.compareTo);
        }
      );

      console.log('existingWorkspace', existingWorkspace);

      const fetchExistingWorkspace = await prisma.workspace.findUnique({
        where: {
          id: existingWorkspace.id,
        },
      });

      console.log('fetchExistingWorkspace', fetchExistingWorkspace);

      const workspace =
        existingWorkspace ??
        (await createWorkspaceWithSlug(
          activeUser.id,
          activeUser.email,
          `${firstName} ${lastName}`,
          slugify(firstName.toLowerCase())
        ));

      console.log('workspace', workspace);

      const existingStudentRecord = await prisma.studentRecord.findUnique({
        where: {
          studentId: workspace.id,
        },
      });

      console.log('existingStudentRecord', existingStudentRecord);

      const studentRecord =
        existingStudentRecord ??
        (await createStudentRecord(
          workspace.id,
          student.firstName,
          student.middleName,
          student.lastName,
          new Date(student.birthDate),
          student.gender,
          student.religion,
          student.incomingGradeLevel,
          student.enrollmentType,
          student.program,
          student.accreditation,
          'From Import',
          'From Import',
          'From Import',
          undefined,
          undefined,
          undefined,
          undefined
        ));

      console.log('studentRecord', studentRecord);

      const existingSchoolFees = await prisma.schoolFee.findMany({
        where: {
          student: {
            is: {
              id: workspace.id,
            },
          },
        },
      });

      const schoolFees =
        existingSchoolFees.length > 0
          ? existingSchoolFees
          : await createSchoolFeesInImport({
              program: student.program,
              accreditation: student.accreditation,
              incomingGradeLevel: student.incomingGradeLevel,
              userId: user.id,
              workspaceId: workspace.id,
              payment: student.paymentType,
              initialPayment: Number(student.initialPayment),
              initialPaymentPending: Number(student.initialPaymentPending),
              secondPayment: Number(student.secondPayment),
              secondPaymentPending: Number(student.secondPaymentPending),
              thirdPayment: Number(student.thirdPayment),
              thirdPaymentPending: Number(student.thirdPaymentPending),
              fourthPayment: Number(student.fourthPayment),
              fourthPaymentPending: Number(student.fourthPaymentPending),
            });

      return {
        session,
        user,
        activeUser,
        existingWorkspace,
        fetchExistingWorkspace,
        workspace,
        studentRecord,
        existingStudentRecord,
        existingSchoolFees,
        schoolFees,
      };
    };

    const data = await processUser(student);

    res.status(200).json({ message: 'Successful import', data });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default handler;
