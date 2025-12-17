import { html, text } from '@/config/email-templates/email-update';
import { sendMail } from '@/lib/server/mail';
import prisma from '@/prisma/index';

export const countUsers = async (startDate, endDate) => {
  const filterDate =
    startDate && endDate
      ? {
        AND: [
          { createdAt: { gte: new Date(startDate) } },
          { createdAt: { lte: new Date(endDate) } },
        ],
      }
      : {};
  return await prisma.user.count({
    where: { ...filterDate, deletedAt: null },
  });
};

export const countVerifiedUsers = async (startDate, endDate) => {
  const filterDate =
    startDate && endDate
      ? {
        AND: [
          { createdAt: { gte: new Date(startDate) } },
          { createdAt: { lte: new Date(endDate) } },
        ],
      }
      : {};
  return await prisma.user.count({
    where: {
      ...filterDate,
      deletedAt: null,
      NOT: { emailVerified: null },
    },
  });
};

export const deactivate = async (id) =>
  await prisma.user.update({
    data: { deletedAt: new Date() },
    where: { id },
  });

export const reactivate = async (id) =>
  await prisma.user.update({
    data: { deletedAt: null },
    where: { id },
  });

export const getGuardianInformation = async (id) =>
  await prisma.guardianInformation.findUnique({
    select: {
      primaryGuardianName: true,
      primaryGuardianOccupation: true,
      primaryGuardianType: true,
      primaryGuardianProfile: true,
      secondaryGuardianName: true,
      secondaryGuardianOccupation: true,
      secondaryGuardianType: true,
      secondaryGuardianProfile: true,
      mobileNumber: true,
      telephoneNumber: true,
      anotherEmail: true,
      address1: true,
      address2: true,
    },
    where: { userId: id },
  });

export const getInvitedUsers = async (userCode) =>
  await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      createdAt: true,
      createdWorkspace: {
        select: {
          studentRecord: true,
        },
        where: { NOT: [{ studentRecord: null }] },
      },
    },
    where: {
      deletedAt: null,
      inviteCode: userCode,
    },
  });

export const getInvitation = async (userCode) =>
  await prisma.user.findFirst({
    select: {
      id: true,
      name: true,
      email: true,
      userCode: true,
    },
    where: {
      deletedAt: null,
      userCode: {
        contains: userCode,
        mode: 'insensitive',
      },
    },
  });

export const getUser = async (id) =>
  await prisma.user.findUnique({
    select: {
      email: true,
      name: true,
      userCode: true,
      guardianInformation: {
        select: {
          primaryGuardianName: true,
          secondaryGuardianName: true,
          address1: true,
          address2: true,
          mobileNumber: true,
          telephoneNumber: true,
        },
      },
    },
    where: { id },
  });

export const getUserByEmail = async (email) =>
  await prisma.user.findUnique({
    select: {
      id: true,
      email: true,
      name: true,
      userCode: true,
    },
    where: { email },
  });

export const getUsers = async () =>
  await prisma.user.findMany({
    orderBy: [{ createdAt: 'desc' }],
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      userType: true,
      createdAt: true,
      deletedAt: true,
    }
  });

export const invite = async (email, inviteCode) => {
  const user = await getUserByEmail(email);

  if (!user) {
    await prisma.user.create({
      data: {
        email,
        inviteCode,
        createdAt: null,
      },
    });
  } else {
    throw new Error('Email already exists');
  }
};

export const updateEmail = async (id, email, previousEmail) => {
  await prisma.user.update({
    data: {
      email,
      emailVerified: null,
    },
    where: { id },
  });
  await sendMail({
    html: html({ email }),
    subject: `[Living Pupil Homeschool] Email address updated`,
    text: text({ email }),
    to: [email, previousEmail],
  });
};

export const updateGuardianInformation = async (id, guardianInformation) =>
  await prisma.guardianInformation.upsert({
    create: { userId: id, ...guardianInformation },
    update: guardianInformation,
    where: { userId: id },
  });

export const updateName = async (id, name) =>
  await prisma.user.update({
    data: { name },
    where: { id },
  });

export const getAffiliateDataPerYear = async (year) => {
  const startDate = new Date(year, 0, 1, 0, 0, 0, 0); // January 1st of the year at 00:00:00
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // December 31st of the year at 23:59:59.999

  // 1. Get all users with a userCode (affiliates)
  const affiliates = await prisma.user.findMany({
    where: {
      deletedAt: null,
      userCode: { not: undefined }, // Only users with a userCode (Prisma string filter)
    },
    select: {
      id: true,
      name: true,
      email: true,
      userCode: true,
      createdAt: true,
    },
  });

  if (!affiliates.length) return [];

  // 2. Get all users who were invited (inviteCode in affiliate userCodes) with workspaces created in the specified year
  const affiliateCodes = affiliates.map(a => a.userCode);
  const invitedUsers = await prisma.user.findMany({
    where: {
      deletedAt: null,
      inviteCode: { in: affiliateCodes },
      createdWorkspace: {
        some: {
          studentRecord: {
            is: {
              studentStatus: { in: ["ENROLLED", "INITIALLY_ENROLLED"] }
            }
          },
          createdAt: { gte: startDate, lte: endDate },
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      inviteCode: true,
      createdAt: true,
      createdWorkspace: {
        where: {
          studentRecord: {
            is: {
              studentStatus: { in: ["ENROLLED", "INITIALLY_ENROLLED"] }
            }
          },
          createdAt: { gte: startDate, lte: endDate },
        },
        select: {
          id: true,
          createdAt: true,
          studentRecord: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              incomingGradeLevel: true,
              formerSchoolName: true,
              studentStatus: true,
            },
          },
        },
      },
    },
  });

  // 3. Group invited users by affiliate userCode
  const affiliateMap = Object.fromEntries(affiliates.map(a => [a.userCode, { ...a, invitedUsers: [] }]));
  for (const user of invitedUsers) {
    if (affiliateMap[user.inviteCode]) {
      affiliateMap[user.inviteCode].invitedUsers.push(user);
    }
  }

  // 4. Only return affiliates with at least one successful invite
  return Object.values(affiliateMap).filter(a => a.invitedUsers.length > 0);
};

// Student Import Service Functions

export const getUserWithGuardianInfo = async (email) =>
  await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      userCode: true,
      emailVerified: true,
      guardianInformation: true,
    },
  });

export const createGuardianUser = async (email, name) =>
  await prisma.user.create({
    data: {
      email,
      name,
      emailVerified: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      userCode: true,
    },
  });

export const createGuardianInformation = async (userId, guardianData) =>
  await prisma.guardianInformation.create({
    data: {
      userId,
      primaryGuardianName: guardianData.primaryGuardianName || null,
      primaryGuardianOccupation: guardianData.primaryGuardianOccupation || null,
      primaryGuardianType: guardianData.primaryGuardianType || null,
      primaryGuardianProfile: guardianData.primaryGuardianProfile || null,
      secondaryGuardianName: guardianData.secondaryGuardianName || null,
      secondaryGuardianOccupation: guardianData.secondaryGuardianOccupation || null,
      secondaryGuardianType: guardianData.secondaryGuardianType || null,
      secondaryGuardianProfile: guardianData.secondaryGuardianProfile || null,
      mobileNumber: guardianData.mobileNumber || null,
      telephoneNumber: guardianData.telephoneNumber || null,
      anotherEmail: guardianData.anotherEmail || null,
      address1: guardianData.address1 || null,
      address2: guardianData.address2 || null,
    },
  });
