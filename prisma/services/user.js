import { html, text } from '@/config/email-templates/email-update';
import { sendMail } from '@/lib/server/mail';
import prisma from '@/prisma/index';

export const countUsers = async () =>
  await prisma.user.count({
    where: { deletedAt: null },
  });

export const countVerifiedUsers = async () =>
  await prisma.user.count({
    where: {
      deletedAt: null,
      NOT: { emailVerified: null },
    },
  });

export const deactivate = async (id) =>
  await prisma.user.update({
    data: { deletedAt: new Date() },
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

export const getUser = async (id) =>
  await prisma.user.findUnique({
    select: {
      email: true,
      name: true,
      userCode: true,
    },
    where: { id },
  });

export const getUsers = async () =>
  await prisma.user.findMany({
    orderBy: [{ createdAt: 'desc' }],
    select: {
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      userType: true,
      createdAt: true,
    },
    where: { deletedAt: null },
  });

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
