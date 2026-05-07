/**
 * Parent-facing student list and per-student school years (legacy Workspace + StudentV2 / EnrollmentV2).
 */

import { randomUUID } from 'crypto';

import { EnrollmentStatusV2, InvitationStatus, Program } from '@prisma/client';

import prisma from '@/prisma/index';
import { createSchoolFees } from '@/prisma/services/school-fee';
import { ensureV2EnrollmentStackForLegacyWorkspace } from '@/prisma/services/student-v2';
import { updateGuardianInformation } from '@/prisma/services/user';
import { getMonthIndexForSchoolYear, SCHOOL_YEAR } from '@/utils/constants';
import {
  buildFullNameFromParts,
  normalizeFullNameFromParts,
  normalizeFullNameString,
} from '@/utils/student-name';

/** Same visibility as getWorkspaces: workspaces the user created or is an accepted member of. */
function workspaceAccessWhere(userId, email) {
  return {
    OR: [
      { id: userId },
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
        gte: new Date('01/01/2023'),
        lte: new Date('06/30/2026'),
      },
    },
  };
}

/**
 * `studentKey` in routes is legacy `Workspace.id` (and `StudentV2.studentId` after sync).
 */
export async function getParentStudentSummaries(userId, email) {
  const rows = await prisma.workspace.findMany({
    where: workspaceAccessWhere(userId, email),
    select: {
      id: true,
      name: true,
      slug: true,
      studentRecord: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const ids = rows.map((r) => r.id);
  const v2Rows =
    ids.length === 0
      ? []
      : await prisma.studentV2.findMany({
          where: { studentId: { in: ids }, deletedAt: null },
          select: {
            studentId: true,
            firstName: true,
            middleName: true,
            lastName: true,
          },
        });
  const v2ByStudentId = new Map(v2Rows.map((s) => [s.studentId, s]));

  return rows.map((w) => {
    const v2 = v2ByStudentId.get(w.id);
    const sr = w.studentRecord;
    const fromV2 = v2 ? buildFullNameFromParts(v2.firstName, v2.middleName, v2.lastName) : '';
    const fromLegacy = sr ? buildFullNameFromParts(sr.firstName, sr.middleName, sr.lastName) : '';
    const fullName = fromV2 || fromLegacy || w.name || 'Student';

    return {
      studentKey: w.id,
      fullName,
      workspaceSlug: w.slug,
    };
  });
}

/**
 * Whether the parent already has a student whose full name matches (first + middle + last),
 * compared case-insensitively with normalized whitespace.
 */
export async function parentHasStudentWithFullName(
  userId,
  email,
  firstName,
  middleName,
  lastName
) {
  const key = normalizeFullNameFromParts(firstName, middleName, lastName);
  if (!key) return false;
  const summaries = await getParentStudentSummaries(userId, email);
  return summaries.some(
    (s) => normalizeFullNameString(s.fullName) === key
  );
}

async function getAccessibleWorkspaceForParent(userId, email, studentKey) {
  return prisma.workspace.findFirst({
    where: {
      id: studentKey,
      ...workspaceAccessWhere(userId, email),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      studentRecord: {
        select: {
          schoolYear: true,
          firstName: true,
          middleName: true,
          lastName: true,
          formerSchoolName: true,
          formerSchoolAddress: true,
        },
      },
    },
  });
}

/**
 * V2 enrollments for a student (workspace id === StudentV2.studentId), plus legacy year string if no rows.
 */
export async function getStudentSchoolYearsForParent(userId, email, studentKey) {
  const workspace = await getAccessibleWorkspaceForParent(userId, email, studentKey);
  if (!workspace) {
    return { error: 'NOT_FOUND' };
  }

  const sv2 = await prisma.studentV2.findFirst({
    where: { studentId: studentKey, deletedAt: null },
    select: { firstName: true, middleName: true, lastName: true },
  });
  const sr = workspace.studentRecord;
  const fromV2 = sv2 ? buildFullNameFromParts(sv2.firstName, sv2.middleName, sv2.lastName) : '';
  const fromLegacy = sr ? buildFullNameFromParts(sr.firstName, sr.middleName, sr.lastName) : '';
  const fullName = fromV2 || fromLegacy || workspace.name || 'Student';

  const enrollments = await prisma.enrollmentV2.findMany({
    where: {
      studentId: studentKey,
      deletedAt: null,
    },
    select: {
      id: true,
      enrollmentStatus: true,
      enrollmentType: true,
      gradeLevel: true,
      program: true,
      cottageType: true,
      accreditation: true,
      reportCard: true,
      signature: true,
      policyAgreement: true,
      formerRegistrar: true,
      formerRegistrarEmail: true,
      formerRegistrarNumber: true,
      schoolYear: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
        },
      },
    },
    orderBy: { schoolYear: { startDate: 'desc' } },
  });

  const legacySchoolYear = sr?.schoolYear?.trim() || null;

  const fullStudentRecord = await prisma.studentRecord.findUnique({
    where: { studentId: studentKey },
  });

  return {
    studentKey: workspace.id,
    fullName,
    workspaceSlug: workspace.slug,
    enrollments,
    legacySchoolYear,
    formerSchoolName: sr?.formerSchoolName ?? '',
    formerSchoolAddress: sr?.formerSchoolAddress ?? '',
    studentRecord: fullStudentRecord,
  };
}

const CURRENT_SY_NAME = SCHOOL_YEAR.SY_2026_2027;

async function ensureSchoolYearV2Named(createdById, name, startDate, endDate) {
  const existing = await prisma.schoolYearV2.findFirst({
    where: { name, deletedAt: null },
  });
  if (existing) return existing;
  return prisma.schoolYearV2.create({
    data: {
      name,
      startDate,
      endDate,
      createdById,
    },
  });
}

/** Date range for known `SCHOOL_YEAR` labels (June–March, PH-style SY). */
function startEndDatesForSchoolYearLabel(name) {
  if (name === SCHOOL_YEAR.SY_2026_2027) {
    return { startDate: new Date(2026, 5, 1), endDate: new Date(2027, 2, 31) };
  }
  if (name === SCHOOL_YEAR.SY_2025_2026) {
    return { startDate: new Date(2025, 5, 1), endDate: new Date(2026, 2, 31) };
  }
  return null;
}

/**
 * School years for the parent enrollment picker: ensures current SY exists,
 * lists all active years with {@link SCHOOL_YEAR.SY_2026_2027} first.
 */
export async function listSchoolYearsV2(createdById) {
  await ensureSchoolYearV2Named(
    createdById,
    CURRENT_SY_NAME,
    new Date(2026, 5, 1),
    new Date(2027, 2, 31)
  );

  const rows = await prisma.schoolYearV2.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
    },
  });

  return rows.sort((a, b) => {
    if (a.name === CURRENT_SY_NAME && b.name !== CURRENT_SY_NAME) return -1;
    if (b.name === CURRENT_SY_NAME && a.name !== CURRENT_SY_NAME) return 1;
    return new Date(b.startDate) - new Date(a.startDate);
  });
}

/**
 * Creates a new `EnrollmentV2` for an existing legacy workspace student.
 * Ensures the V2 stack exists first (idempotent).
 */
export async function createParentEnrollmentV2(userId, email, studentKey, input) {
  const workspace = await getAccessibleWorkspaceForParent(userId, email, studentKey);
  if (!workspace) {
    return { error: 'NOT_FOUND' };
  }
  if (!workspace.studentRecord) {
    return { error: 'NO_STUDENT_RECORD' };
  }

  await ensureV2EnrollmentStackForLegacyWorkspace(studentKey);

  const wv2 = await prisma.workspaceV2.findFirst({
    where: { workspaceId: studentKey, deletedAt: null },
  });
  if (!wv2) {
    return { error: 'V2_NOT_READY' };
  }

  const range = startEndDatesForSchoolYearLabel(input.schoolYear);
  if (!range) {
    return { error: 'INVALID_SCHOOL_YEAR' };
  }

  await ensureSchoolYearV2Named(
    userId,
    input.schoolYear,
    range.startDate,
    range.endDate
  );

  const schoolYearRow = await prisma.schoolYearV2.findFirst({
    where: { name: input.schoolYear, deletedAt: null },
  });
  if (!schoolYearRow) {
    return { error: 'INVALID_SCHOOL_YEAR' };
  }

  const existing = await prisma.enrollmentV2.findFirst({
    where: {
      studentId: studentKey,
      schoolYearId: schoolYearRow.id,
      deletedAt: null,
    },
  });
  if (existing) {
    return { error: 'ALREADY_ENROLLED' };
  }

  const enrollment = await prisma.enrollmentV2.create({
    data: {
      enrollmentCode: `ENR-${randomUUID()}`,
      enrollmentType: input.enrollmentType,
      gradeLevel: input.gradeLevel,
      program: input.program,
      cottageType:
        input.program === Program.HOMESCHOOL_COTTAGE
          ? input.cottageType ?? null
          : null,
      accreditation: input.accreditation,
      reportCard: input.reportCard?.trim() || null,
      discount: null,
      enrollmentStatus: EnrollmentStatusV2.PENDING,
      scholarship: null,
      signature: input.signature?.trim() || null,
      policyAgreement: input.policyAgreement !== false,
      formerRegistrar: input.formerRegistrar?.trim() || null,
      formerRegistrarEmail: input.formerRegistrarEmail?.trim() || null,
      formerRegistrarNumber: input.formerRegistrarNumber?.trim() || null,
      workspaceId: wv2.workspaceId,
      studentId: studentKey,
      createdById: userId,
      schoolYearId: schoolYearRow.id,
    },
    select: {
      id: true,
      enrollmentCode: true,
      enrollmentStatus: true,
      schoolYear: { select: { id: true, name: true } },
    },
  });

  return { enrollment };
}

/**
 * Full parent flow for an additional school year: guardian, legacy student record,
 * `EnrollmentV2`, and tuition `createSchoolFees` (legacy + mirrored V2).
 */
export async function completeParentYearEnrollment(userId, email, studentKey, input) {
  const workspace = await getAccessibleWorkspaceForParent(userId, email, studentKey);
  if (!workspace) {
    return { error: 'NOT_FOUND' };
  }
  if (!workspace.studentRecord) {
    return { error: 'NO_STUDENT_RECORD' };
  }

  await updateGuardianInformation(userId, {
    primaryGuardianName: input.primaryGuardianName,
    primaryGuardianOccupation: input.primaryGuardianOccupation,
    primaryGuardianType: input.primaryGuardianType,
    primaryGuardianProfile: input.primaryGuardianProfile,
    secondaryGuardianName: input.secondaryGuardianName,
    secondaryGuardianOccupation: input.secondaryGuardianOccupation,
    secondaryGuardianType: input.secondaryGuardianType,
    secondaryGuardianProfile: input.secondaryGuardianProfile,
    mobileNumber: input.mobileNumber,
    telephoneNumber: input.telephoneNumber,
    anotherEmail: input.anotherEmail,
  });

  const specialNeedSpecific =
    input.specialRadio === 'YES' ? String(input.specialNeeds || '').trim() : null;

  await prisma.studentRecord.update({
    where: { studentId: studentKey },
    data: {
      incomingGradeLevel: input.gradeLevel,
      enrollmentType: input.enrollmentType,
      program: input.program,
      cottageType: input.cottageType || null,
      accreditation: input.accreditation,
      schoolYear: input.schoolYear,
      reason: input.reason?.trim() || null,
      formerSchoolName: input.formerSchoolName.trim(),
      formerSchoolAddress: input.formerSchoolAddress.trim(),
      reportCard: input.reportCardLink?.trim() || null,
      primaryTeacherName: input.primaryTeacherName?.trim() || null,
      primaryTeacherAge: input.primaryTeacherAge?.trim() || null,
      primaryTeacherRelationship: input.primaryTeacherRelationship?.trim() || null,
      primaryTeacherEducation: input.primaryTeacherEducation?.trim() || null,
      primaryTeacherProfile: input.primaryTeacherProfile?.trim() || null,
      signature: input.signatureLink?.trim() || null,
      specialNeeds: input.specialRadio || null,
      specialNeedSpecific,
      formerRegistrar: input.formerRegistrar?.trim() || null,
      formerRegistrarEmail: input.formerRegistrarEmail?.trim() || null,
      formerRegistrarNumber: input.formerRegistrarNumber?.trim() || null,
      discount: input.discountCode?.trim() || null,
    },
  });

  const monthIndex = getMonthIndexForSchoolYear(input.schoolYear, new Date());

  const enrollResult = await createParentEnrollmentV2(userId, email, studentKey, {
    schoolYear: input.schoolYear,
    enrollmentType: input.enrollmentType,
    gradeLevel: input.gradeLevel,
    program: input.program,
    cottageType: input.cottageType || null,
    accreditation: input.accreditation,
    reportCard: input.reportCardLink,
    signature: input.signatureLink,
    policyAgreement: input.policyAgreement === true,
    formerRegistrar: input.formerRegistrar,
    formerRegistrarEmail: input.formerRegistrarEmail,
    formerRegistrarNumber: input.formerRegistrarNumber,
  });

  if (enrollResult.error) {
    return enrollResult;
  }

  try {
    const schoolFee = await createSchoolFees(
      userId,
      email,
      studentKey,
      input.payment,
      input.enrollmentType,
      input.gradeLevel,
      input.program,
      input.cottageType || null,
      input.accreditation,
      input.paymentMethod,
      input.discountCode || '',
      monthIndex,
      input.scholarshipCode || ''
    );
    return {
      enrollment: enrollResult.enrollment,
      schoolFee: {
        ...schoolFee.transaction,
        amount: schoolFee.amount,
        url: schoolFee.transaction?.url,
        transactionId: schoolFee.transaction?.transactionId,
      },
    };
  } catch (e) {
    return { error: 'FEE_CREATE_FAILED', message: e?.message || String(e) };
  }
}
