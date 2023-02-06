import { validateSession } from "@/config/api-validation";
import prisma from "@/prisma/index";
import { createStudentRecord } from "@/prisma/services/student-record";
import { createWorkspaceWithSlug } from "@/prisma/services/workspace";
import slugify from 'slugify';

const handler = async (req, res) => {
 try {
    const student = {
        lastName: "ROBANTE",
        firstName: "KHLOE COLLEEN",
        middleName: "Dinorog",
        incomingGradeLevel: "GRADE_6",
        amount: 7200,
        datePaid: "8/3/2022",
        paymentType: "SEMI_ANNUAL",
        email: "babydaughson@gmail.com",
        secondaryEmail: "babydaughson@yahoo.com",
        birthDate: "7/29/2011",
        gender: "FEMALE",
        religion: "ROMAN_CATHOLIC",
        enrollmentType: "CONTINUING",
        program: "HOMESCHOOL_PROGRAM",
        accreditation: "LOCAL"
    }

    const processUser = async ({ email, firstName, lastName }) => {
      const session = await validateSession(req, res);

      const user = await prisma.user.findUnique({
        select: {
          id: true,
          email: true,
          name: true,
          userCode: true,
          createdWorkspace: true
        },
        where: { email },
      });

      const activeUser = user ?? await prisma.user.findUnique({
        select: {
          id: true,
          email: true,
          name: true,
          userCode: true,
          createdWorkspace: true
        },
        where: { id: session.user.userId },
      });

      const existingWorkspace = activeUser.createdWorkspace.find((workspace) => {
        const validation = workspace.name.length > firstName.length ? {
          compareWith: workspace.name.toLowerCase(),
          compareTo: firstName.toLowerCase()
        } : {
          compareWith: firstName.toLowerCase(),
          compareTo: workspace.name.toLowerCase()
        }

        return validation.compareWith.includes(validation.compareTo)
      })

      const workspace = existingWorkspace ?? await createWorkspaceWithSlug(
        activeUser.id,
        activeUser.email,
        `${firstName} ${lastName}`,
        slugify(firstName.toLowerCase())
      );

      const studentRecord = workspace.studentRecord ?? await createStudentRecord(
        workspace.id,
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
        'From Import',
        'From Import'
      )

      return {
        session,
        user,
        activeUser,
        existingWorkspace,
        workspace,
        studentRecord
      }
    }

    const data = await processUser(student);

    res.status(200).json({ message: 'Successful import', data });
 } catch (error) {
    console.log(error)
    throw error;
    res.status(400).json({
      error
    })
 }
}

export default handler;
