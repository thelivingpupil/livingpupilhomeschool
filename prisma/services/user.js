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
      id : true,
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
