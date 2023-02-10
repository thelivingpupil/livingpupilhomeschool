import { validateSession } from '@/config/api-validation';
import prisma from '@/prisma/index';
import { createStudentRecord } from '@/prisma/services/student-record';
import { createWorkspaceWithSlug } from '@/prisma/services/workspace';
import slugify from 'slugify';

const handler = async (req, res) => {
  try {
    const student = {
      lastName: 'ROBANTE',
      firstName: 'KHLOE COLLEEN',
      middleName: 'Dinorog',
      incomingGradeLevel: 'GRADE_6',
      amount: 7200,
      datePaid: '8/3/2022',
      paymentType: 'SEMI_ANNUAL',
      email: 'babydaughson@gmail.com',
      secondaryEmail: 'babydaughson@yahoo.com',
      birthDate: '7/29/2011',
      gender: 'FEMALE',
      religion: 'ROMAN_CATHOLIC',
      enrollmentType: 'CONTINUING',
      program: 'HOMESCHOOL_PROGRAM',
      accreditation: 'LOCAL',
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

      const fetchExistingWorkspace = await prisma.workspace.findUnique({
        where: {
          id: existingWorkspace.id,
        },
      });

      const workspace =
        existingWorkspace ??
        (await createWorkspaceWithSlug(
          activeUser.id,
          activeUser.email,
          `${firstName} ${lastName}`,
          slugify(firstName.toLowerCase())
        ));

      const existingStudentRecord = await prisma.studentRecord.findUnique({
        where: {
          studentId: workspace.id,
        },
      });

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

      const existingSchoolFees = await prisma.schoolFee.findMany({
        where: {
          student: {
            is: {
              id: workspace.id,
            },
          },
        },
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
