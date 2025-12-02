import { InvitationStatus } from '@prisma/client';
import prisma from '@/prisma/index';

export const getMember = async (id) =>
  await prisma.member.findFirst({
    select: { teamRole: true },
    where: { id },
  });

export const getMembers = async (slug) =>
  await prisma.member.findMany({
    select: {
      id: true,
      email: true,
      status: true,
      teamRole: true,
      member: { select: { name: true } },
    },
    where: {
      deletedAt: null,
      workspace: {
        deletedAt: null,
        slug,
      },
    },
  });

export const getPendingInvitations = async (email) =>
  await prisma.member.findMany({
    select: {
      id: true,
      email: true,
      joinedAt: true,
      status: true,
      teamRole: true,
      invitedBy: {
        select: {
          email: true,
          name: true,
        },
      },
      workspace: {
        select: {
          createdAt: true,
          inviteCode: true,
          name: true,
          slug: true,
          workspaceCode: true,
          creator: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
    where: {
      deletedAt: null,
      email,
      status: InvitationStatus.PENDING,
      workspace: { deletedAt: null },
    },
  });

export const remove = async (id) =>
  await prisma.member.update({
    data: { deletedAt: new Date() },
    where: { id },
  });

export const toggleRole = async (id, teamRole) =>
  await prisma.member.update({
    data: { teamRole },
    where: { id },
  });

export const updateStatus = async (id, status) =>
  await prisma.member.update({
    data: {
      status: status,
      joinedAt: new Date(), // Update the joinedAt field with the current date and time
    },
    where: { id },
  });

export const joinMembership = async (workspaceId, status, email) => {
  // Get workspace to find creator email for inviter field
  const workspace = await prisma.workspace.findFirst({
    select: {
      creator: {
        select: {
          email: true,
        },
      },
    },
    where: {
      id: workspaceId,
      deletedAt: null,
    },
  });

  if (!workspace || !workspace.creator?.email) {
    throw new Error('Unable to find workspace');
  }

  // Use upsert to create member if it doesn't exist, or update if it does
  const joinedAt = new Date();
  await prisma.member.upsert({
    create: {
      workspaceId: workspaceId,
      email: email,
      inviter: workspace.creator.email,
      status: status,
      joinedAt: joinedAt,
    },
    update: {
      status: status,
      joinedAt: joinedAt,
      // Don't update inviter if member already exists - preserve original inviter
    },
    where: {
      workspaceId_email: {
        workspaceId: workspaceId,
        email: email,
      },
    },
  });

  return joinedAt;
};
