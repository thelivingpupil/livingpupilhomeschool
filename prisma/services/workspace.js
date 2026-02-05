import { InvitationStatus, TeamRole } from '@prisma/client';
import slugify from 'slugify';
import {
  html as updateHtml,
  text as updateText,
} from '@/config/email-templates/email-update';
import {
  html as createHtml,
  text as createText,
} from '@/config/email-templates/workspace-create';
import {
  html as deleteHtml,
  text as deleteText,
} from '@/config/email-templates/workspace-delete';
import {
  html as deleteRequestHtml,
  text as deleteRequestText,
} from '@/config/email-templates/workspace-delete-request';
import {
  html as inviteHtml,
  text as inviteText,
} from '@/config/email-templates/invitation';
import { sendMail } from '@/lib/server/mail';
import prisma from '@/prisma/index';

export const countWorkspaces = async (slug) =>
  await prisma.workspace.count({
    where: { slug: { startsWith: slug } },
  });

export const createWorkspaceWithSlug = async (creatorId, email, name, slug) => {
  const workspace = await prisma.workspace.create({
    data: {
      creatorId,
      members: {
        create: {
          email,
          inviter: email,
          status: InvitationStatus.ACCEPTED,
          teamRole: TeamRole.OWNER,
        },
      },
      name,
      slug,
    },
    select: { id: true },
  });
  await sendMail({
    html: createHtml({ code: workspace.inviteCode, name }),
    subject: `[Living Pupil Homeschool] Student Record Created: ${name}`,
    text: createText({ code: workspace.inviteCode, name }),
    to: email,
  });
  return workspace;
};

export const createWorkspace = async (creatorId, email, name, slug) => {
  const count = await countWorkspaces(slug);

  if (count > 0) {
    slug = `${slug}-${count}`;
  }

  const workspace = await prisma.workspace.create({
    data: {
      creatorId,
      members: {
        create: {
          email,
          inviter: email,
          status: InvitationStatus.ACCEPTED,
          teamRole: TeamRole.OWNER,
        },
      },
      name,
      slug,
    },
  });
  await sendMail({
    html: createHtml({ code: workspace.inviteCode, name }),
    subject: `[Living Pupil Homeschool] Student Record Created: ${name}`,
    text: createText({ code: workspace.inviteCode, name }),
    to: email,
  });
};

// import { html, text } from './emailTemplates';

export const deleteWorkspace = async (id, email, slug) => {
  // Deletion is intentionally disabled. Use requestWorkspaceDeletion instead.
  // Keeping this function (and export) prevents import breakage, but ensures no records are deleted.
  const workspace = await getOwnWorkspace(id, email, slug);
  if (!workspace) throw new Error('Unable to find workspace');
  throw new Error('Workspace deletion is disabled. Please send a deletion request instead.');
};

export const requestWorkspaceDeletion = async (id, email, slug) => {
  const workspace = await getOwnWorkspace(id, email, slug);
  if (!workspace) throw new Error('Unable to find workspace');

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) throw new Error('ADMIN_EMAIL is not configured');

  const detailed = await prisma.workspace.findUnique({
    where: { id: workspace.id },
    select: {
      id: true,
      name: true,
      slug: true,
      studentRecord: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
          incomingGradeLevel: true,
          schoolYear: true,
        },
      },
    },
  });

  const studentName = detailed?.studentRecord
    ? [detailed.studentRecord.firstName, detailed.studentRecord.middleName, detailed.studentRecord.lastName]
        .filter(Boolean)
        .join(' ')
    : '';

  const gradeLevel = detailed?.studentRecord?.incomingGradeLevel || '';
  const schoolYear = detailed?.studentRecord?.schoolYear || '';

  const requestedAt = new Date().toISOString();

  await sendMail({
    to: adminEmail,
    subject: `[Living Pupil Homeschool] Deletion request for ${workspace.name}`,
    html: deleteRequestHtml({
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      workspaceSlug: slug,
      studentName,
      gradeLevel,
      schoolYear,
      requesterEmail: email,
      requesterUserId: id,
      requestedAt,
    }),
    text: deleteRequestText({
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      workspaceSlug: slug,
      studentName,
      gradeLevel,
      schoolYear,
      requesterEmail: email,
      requesterUserId: id,
      requestedAt,
    }),
  });

  return { requestedAt };
};

export const getInvitation = async (inviteCode) =>
  await prisma.workspace.findFirst({
    select: {
      id: true,
      name: true,
      workspaceCode: true,
      slug: true,
    },
    where: {
      deletedAt: null,
      inviteCode,
    },
  });

export const getOwnWorkspace = async (id, email, slug) =>
  await prisma.workspace.findFirst({
    select: {
      id: true,
      inviteCode: true,
      name: true,
    },
    where: {
      OR: [
        { id },
        {
          members: {
            some: {
              deletedAt: null,
              teamRole: TeamRole.OWNER,
              email,
            },
          },
        },
      ],
      AND: {
        deletedAt: null,
        slug,
      },
    },
  });

export const getSiteWorkspace = async (slug, customDomain) =>
  await prisma.workspace.findFirst({
    select: {
      id: true,
      name: true,
      slug: true,
      domains: { select: { name: true } },
    },
    where: {
      OR: [
        { slug },
        customDomain
          ? {
            domains: {
              some: {
                name: slug,
                deletedAt: null,
              },
            },
          }
          : undefined,
      ],
      AND: { deletedAt: null },
    },
  });

export const getSingleWorkspace = async (id, email, slug) =>
  await prisma.workspace.findFirst({
    select: {
      createdAt: true,
      creator: {
        select: {
          email: true,
          name: true,
        },
      },
      inviteCode: true,
      members: {
        select: {
          member: {
            select: {
              email: true,
              image: true,
              name: true,
            },
          },
          joinedAt: true,
          status: true,
          teamRole: true,
        },
      },
      name: true,
      slug: true,
      workspaceCode: true,
      studentRecord: {
        select: {
          studentId: true,
          firstName: true,
          middleName: true,
          lastName: true,
          birthDate: true,
          gender: true,
          religion: true,
          incomingGradeLevel: true,
          enrollmentType: true,
          program: true,
          accreditation: true,
          schoolYear: true,
          reason: true,
          formerSchoolName: true,
          formerSchoolAddress: true,
          image: true,
          liveBirthCertificate: true,
          reportCard: true,
          idPicture: true,
          createdAt: true,
        },
      },
      schoolFees: {
        select: {
          studentId: true,
          transactionId: true,
          order: true,
          gradeLevel: true,
          paymentType: true,
          transaction: {
            select: {
              transactionId: true,
              referenceNumber: true,
              userId: true,
              amount: true,
              balance: true,
              payment: true,
              currency: true,
              transactionStatus: true,
              paymentProofLink: true,
              paymentStatus: true,
              source: true,
              paymentReference: true,
              description: true,
              message: true,
              url: true,
              purchaseHistoryId: true,
              createdAt: true,
            },
          },
          createdAt: true,
          deletedAt: true,
        },
        where: {
          deletedAt: null,
        },
      },
    },
    where: {
      OR: [
        { id },
        {
          members: {
            some: {
              email,
              deletedAt: null,
              status: InvitationStatus.ACCEPTED,
            },
          },
        },
      ],
      AND: {
        deletedAt: null,
        slug,
      },
    },
  });

export const getWorkspace = async (id, email, slug) =>
  await prisma.workspace.findFirst({
    select: {
      creatorId: true,
      name: true,
      inviteCode: true,
      slug: true,
      workspaceCode: true,
      creator: {
        select: {
          email: true,
          guardianInformation: {
            select: {
              id: true,
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
              parentTraining: {
                where: {
                  deletedAt: null,
                },
                select: {
                  id: true,
                  courseCode: true,
                  schoolYear: true,
                  status: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
            },
          },
        },
      },
      members: {
        select: {
          email: true,
          teamRole: true,
        },
      },
      studentRecord: {
        select: {
          studentId: true,
          firstName: true,
          middleName: true,
          lastName: true,
          birthDate: true,
          gender: true,
          religion: true,
          incomingGradeLevel: true,
          enrollmentType: true,
          program: true,
          accreditation: true,
          schoolYear: true,
          reason: true,
          formerSchoolName: true,
          formerSchoolAddress: true,
          image: true,
          liveBirthCertificate: true,
          reportCard: true,
          idPictureFront: true,
          idPictureBack: true,
          createdAt: true,
        },
      },
      schoolFees: {
        select: {
          studentId: true,
          transactionId: true,
          order: true,
          gradeLevel: true,
          paymentType: true,
          transaction: {
            select: {
              transactionId: true,
              referenceNumber: true,
              userId: true,
              amount: true,
              balance: true,
              payment: true,
              currency: true,
              transactionStatus: true,
              paymentProofLink: true,
              paymentStatus: true,
              source: true,
              paymentReference: true,
              description: true,
              message: true,
              url: true,
              purchaseHistoryId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          createdAt: true,
          deletedAt: true,
        },
        where: {
          deletedAt: null,
        },
      },
    },
    where: {
      OR: [
        { id },
        {
          members: {
            some: {
              email,
              deletedAt: null,
            },
          },
        },
      ],
      AND: {
        deletedAt: null,
        slug,
      },
    },
  });

export const getWorkspaces = async (id, email) => {
  const currentYear = new Date().getFullYear();

  const checkSchoolYear = new Date(`08/01/${currentYear}`) > new Date();

  const [fromYear, toYear] = !checkSchoolYear
    ? [currentYear, currentYear + 1]
    : [currentYear - 1, currentYear];
  return await prisma.workspace.findMany({
    select: {
      createdAt: true,
      creator: {
        select: {
          email: true,
          name: true,
          guardianInformation: {
            select: {
              id: true,
              parentTraining: true,
            },
          },
        },
      },
      inviteCode: true,
      members: {
        select: {
          member: {
            select: {
              email: true,
              image: true,
              name: true,
            },
          },
          joinedAt: true,
          status: true,
          teamRole: true,
        },
      },
      name: true,
      slug: true,
      workspaceCode: true,
      id: true,
      studentRecord: {
        select: {
          studentId: true,
          firstName: true,
          middleName: true,
          lastName: true,
          birthDate: true,
          gender: true,
          religion: true,
          incomingGradeLevel: true,
          enrollmentType: true,
          program: true,
          accreditation: true,
          schoolYear: true,
          reason: true,
          formerSchoolName: true,
          formerSchoolAddress: true,
          image: true,
          liveBirthCertificate: true,
          reportCard: true,
          idPictureFront: true,
          idPictureBack: true,
          createdAt: true,
          studentStatus: true,
        },
      },
      schoolFees: {
        select: {
          studentId: true,
          transactionId: true,
          order: true,
          gradeLevel: true,
          paymentType: true,
          transaction: {
            select: {
              transactionId: true,
              referenceNumber: true,
              userId: true,
              amount: true,
              balance: true,
              payment: true,
              currency: true,
              transactionStatus: true,
              paymentProofLink: true,
              paymentStatus: true,
              source: true,
              paymentReference: true,
              description: true,
              message: true,
              url: true,
              purchaseHistoryId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          createdAt: true,
          deletedAt: true,
        },
      },
    },
    where: {
      OR: [
        { id },
        {
          members: {
            some: {
              email,
              deletedAt: null,
              status: InvitationStatus.ACCEPTED,
            },
          },
        },
      ],
      AND: {
        deletedAt: null,
        createdAt: {
          gte: new Date(`01/01/2023`),
          lte: new Date(`06/30/2026`),
        },
      },
    },
  });
};

export const getWorkspacePaths = async () => {
  const [workspaces, domains] = await Promise.all([
    prisma.workspace.findMany({
      select: { slug: true },
      where: { deletedAt: null },
    }),
    prisma.domain.findMany({
      select: { name: true },
      where: { deletedAt: null },
    }),
  ]);
  return [
    ...workspaces.map((workspace) => ({
      params: { site: workspace.slug },
    })),
    ...domains.map((domain) => ({
      params: { site: domain.name },
    })),
  ];
};

export const inviteUsers = async (id, email, members, slug) => {
  const workspace = await getOwnWorkspace(id, email, slug);
  const inviter = email;

  if (workspace) {
    const membersList = members.map(({ email, role }) => ({
      email,
      inviter,
      teamRole: role,
    }));
    const data = members.map(({ email }) => ({
      createdAt: null,
      email,
    }));
    await Promise.all([
      prisma.user.createMany({
        data,
        skipDuplicates: true,
      }),
      prisma.workspace.update({
        data: {
          members: {
            createMany: {
              data: membersList,
              skipDuplicates: true,
            },
          },
        },
        where: { id: workspace.id },
      }),
      sendMail({
        html: inviteHtml({ code: workspace.inviteCode, name: workspace.name }),
        subject: `[Living Pupil Homeschool] You have been invited to view ${workspace.name}'s student records`,
        text: inviteText({ code: workspace.inviteCode, name: workspace.name }),
        to: members.map((member) => member.email),
      }),
    ]);
    return membersList;
  } else {
    throw new Error('Unable to find workspace');
  }
};

export const isWorkspaceCreator = (id, creatorId) => id === creatorId;

export const isWorkspaceOwner = (email, workspace) => {
  let isTeamOwner = false;
  const member = workspace.members.find(
    (member) => member.email === email && member.teamRole === TeamRole.OWNER
  );

  if (member) {
    isTeamOwner = true;
  }

  return isTeamOwner;
};

export const joinWorkspace = async (workspaceCode, email) => {
  const workspace = await prisma.workspace.findFirst({
    select: {
      creatorId: true,
      id: true,
    },
    where: {
      deletedAt: null,
      workspaceCode,
    },
  });

  if (workspace) {
    await prisma.member.upsert({
      create: {
        workspaceId: workspace.id,
        email,
        inviter: workspace.creatorId,
        status: InvitationStatus.ACCEPTED,
      },
      update: {},
      where: {
        workspaceId_email: {
          workspaceId: workspace.id,
          email: email,
        },
      },
    });
    return new Date();
  } else {
    throw new Error('Unable to find workspace');
  }
};

export const updateName = async (id, email, name, slug) => {
  const workspace = await getOwnWorkspace(id, email, slug);

  if (workspace) {
    await prisma.workspace.update({
      data: { name },
      where: { id: workspace.id },
    });
    return name;
  } else {
    throw new Error('Unable to find workspace');
  }
};

export const updateSlug = async (id, email, newSlug, pathSlug) => {
  let slug = slugify(newSlug.toLowerCase());
  const count = await countWorkspaces(slug);

  if (count > 0) {
    slug = `${slug}-${count}`;
  }

  const workspace = await getOwnWorkspace(id, email, pathSlug);

  if (workspace) {
    await prisma.workspace.update({
      data: { slug },
      where: { id: workspace.id },
    });
    return slug;
  } else {
    throw new Error('Unable to find workspace');
  }
};

export const deleteStudentWorkspace = async (inviteCode) =>
  //console.log(workSpaceCode)
  await prisma.workspace.update({
    data: { deletedAt: new Date() },
    where: { inviteCode },
  });

export const getWorkspaceByStudentId = async (studentId) =>
  //console.log(workSpaceCode)
  await prisma.workspace.findFirst({
    select: {
      id: true,
      inviteCode: true,
      name: true,
    },
    where: {
      workspaceCode: studentId,
    },
  });
