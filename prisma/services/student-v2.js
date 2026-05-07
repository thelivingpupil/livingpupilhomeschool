/**
 * Multi-year student model (StudentV2, WorkspaceV2, EnrollmentV2, SchoolYearV2,
 * SchoolFeesV2, TransactionV2).
 *
 * Legacy services (`workspace.js`, `student-record.js`, `school-fee.js`, `transaction.js`)
 * remain the source of legacy tables for now; this module is the **only** place for
 * V2 reads/writes so new code can depend on one module.
 *
 * @module prisma/services/student-v2
 */

import prisma from '@/prisma/index';

// =============================================================================
// V2 functions start here — use these for new features and dual-write/sync paths.
// Legacy equivalents live in workspace.js / student-record.js / school-fee.js / transaction.js
// (marked obsolete in those files) until callers are fully migrated.
// =============================================================================

function str(v) {
  if (v == null || v === undefined) return '';
  return String(v);
}

function mapEnrollmentType(legacy) {
  if (legacy === 'CONTINUING') return 'CONTINUING';
  return 'NEW';
}

function mapEnrollmentStatus(studentStatus) {
  if (!studentStatus) return 'COMPLETED';
  const s = String(studentStatus).toUpperCase();
  if (s === 'PENDING') return 'PENDING';
  if (s === 'REJECTED' || s === 'DROPPED') return 'REJECTED';
  if (s === 'ENROLLED' || s === 'APPROVED') return 'COMPLETED';
  return 'COMPLETED';
}

/**
 * Find or create a SchoolYearV2 row by display name (e.g. StudentRecord.schoolYear).
 */
export async function ensureSchoolYearV2Id(tx, schoolYearLabel, createdById) {
  const name = str(schoolYearLabel).trim() || 'Legacy (unspecified)';
  const existing = await tx.schoolYearV2.findFirst({ where: { name } });
  if (existing) return existing.id;

  const y = new Date().getFullYear();
  const startDate = new Date(y, 5, 1);
  const endDate = new Date(y + 1, 2, 31);

  const row = await tx.schoolYearV2.create({
    data: {
      name,
      startDate,
      endDate,
      createdById,
    },
  });
  return row.id;
}

async function ensureTransactionV2Row(tx, legacy, schoolFeePaymentType) {
  const existing = await tx.transactionV2.findUnique({
    where: { transactionId: legacy.transactionId },
  });
  if (existing) return existing.transactionId;

  await tx.transactionV2.create({
    data: {
      transactionId: legacy.transactionId,
      referenceNumber: legacy.referenceNumber,
      paymentReference: legacy.paymentReference,
      amount: legacy.amount,
      currency: legacy.currency,
      fee: legacy.fee,
      payment: legacy.payment,
      balance: legacy.balance,
      paymentProofLink: legacy.paymentProofLink,
      paymentType: schoolFeePaymentType,
      transactionStatus: legacy.transactionStatus,
      paymentStatus: legacy.paymentStatus,
      description: legacy.description,
      message: legacy.message,
      url: legacy.url,
      source: legacy.source,
      userId: legacy.userId,
    },
  });
  return legacy.transactionId;
}

/**
 * Idempotent: creates StudentV2 + WorkspaceV2 + EnrollmentV2 + mirrors fees to
 * TransactionV2 + SchoolFeesV2 for one legacy workspace (workspace.id = student container).
 * Skips if StudentV2 already exists for `workspaceId`.
 */
export async function ensureV2EnrollmentStackForLegacyWorkspace(workspaceId) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      studentRecord: true,
      schoolFees: {
        include: { transaction: true },
      },
    },
  });

  if (!workspace?.studentRecord) {
    return { skipped: true, reason: 'no studentRecord' };
  }

  const existingStudent = await prisma.studentV2.findUnique({
    where: { studentId: workspace.id },
  });
  if (existingStudent) {
    return { skipped: true, reason: 'already exists' };
  }

  const record = workspace.studentRecord;
  const creatorId = workspace.creatorId;
  const enrollmentType = mapEnrollmentType(record.enrollmentType);
  const enrollmentStatus = mapEnrollmentStatus(record.studentStatus);

  await prisma.$transaction(async (tx) => {
    const schoolYearId = await ensureSchoolYearV2Id(
      tx,
      record.schoolYear,
      creatorId
    );

    await tx.studentV2.create({
      data: {
        id: workspace.id,
        studentId: workspace.id,
        lrn: null,
        firstName: record.firstName,
        middleName: record.middleName,
        lastName: record.lastName,
        birthDate: record.birthDate,
        gender: record.gender,
        religion: record.religion,
        liveBirthCertificate: str(record.liveBirthCertificate),
        idPictureBack: str(record.idPictureBack),
        idPictureFront: str(record.idPictureFront),
        studentAddress1: str(record.studentAddress1),
        studentAddress2: str(record.studentAddress2),
        studentInternationalAddress: str(record.studentInternationalAddress),
        specialNeeds: str(record.specialNeeds),
        specialNeedsSpecific: str(record.specialNeedSpecific),
        studentStatus: record.studentStatus,
        userId: creatorId,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        deletedAt: record.deletedAt,
      },
    });

    const wv2 = await tx.workspaceV2.create({
      data: {
        workspaceId: workspace.id,
        workspaceCode: workspace.workspaceCode,
        inviteCode: workspace.inviteCode,
        name: workspace.name,
        slug: workspace.slug,
        creatorId: workspace.creatorId,
        studentId: workspace.id,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        deletedAt: workspace.deletedAt,
      },
    });

    const enrollment = await tx.enrollmentV2.create({
      data: {
        enrollmentCode: `mig-${workspace.id}`,
        enrollmentType,
        gradeLevel: record.incomingGradeLevel,
        program: record.program,
        cottageType: record.cottageType,
        accreditation: record.accreditation,
        reportCard: record.reportCard,
        discount: record.discount,
        enrollmentStatus,
        scholarship: record.scholarship,
        signature: record.signature,
        policyAgreement: record.policyAgreement,
        formerRegistrar: record.formerRegistrar,
        formerRegistrarEmail: record.formerRegistrarEmail,
        formerRegistrarNumber: record.formerRegistrarNumber,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        deletedAt: record.deletedAt,
        workspaceId: wv2.workspaceId,
        studentId: workspace.id,
        createdById: creatorId,
        schoolYearId,
      },
    });

    for (const fee of workspace.schoolFees || []) {
      const legacyTx = fee.transaction;
      if (!legacyTx) continue;

      await ensureTransactionV2Row(tx, legacyTx, fee.paymentType);

      const existingFee = await tx.schoolFeesV2.findUnique({
        where: { transactionId: legacyTx.transactionId },
      });
      if (existingFee) continue;

      await tx.schoolFeesV2.create({
        data: {
          order: fee.order,
          createdAt: fee.createdAt,
          updatedAt: fee.updatedAt,
          deletedAt: fee.deletedAt,
          transactionId: legacyTx.transactionId,
          enrollmentId: enrollment.id,
        },
      });
    }
  });

  return { skipped: false };
}

/**
 * Copy mutable payment fields from legacy Transaction to TransactionV2 when present.
 */
export async function mirrorTransactionV2FromLegacyUpdate(transactionId, data) {
  const v2 = await prisma.transactionV2.findUnique({
    where: { transactionId },
  });
  if (!v2) return null;

  const patch = {};
  if (data.paymentReference !== undefined) patch.paymentReference = data.paymentReference;
  if (data.paymentStatus !== undefined) patch.paymentStatus = data.paymentStatus;
  if (data.message !== undefined) patch.message = data.message;
  if (data.balance !== undefined) patch.balance = data.balance;
  if (data.payment !== undefined) patch.payment = data.payment;
  if (data.amount !== undefined) patch.amount = data.amount;
  if (data.transactionStatus !== undefined) patch.transactionStatus = data.transactionStatus;
  if (data.url !== undefined) patch.url = data.url;
  if (data.paymentProofLink !== undefined) patch.paymentProofLink = data.paymentProofLink;

  if (Object.keys(patch).length === 0) return v2;

  return prisma.transactionV2.update({
    where: { transactionId },
    data: patch,
  });
}

/**
 * After legacy `renewTransaction` / `renewOldTransaction` changes `transactionId`,
 * drop old V2 rows and recreate from the updated legacy `Transaction` + `SchoolFee`.
 */
export async function replaceTransactionV2AfterRenew(oldTransactionId, newTransactionId) {
  await prisma.schoolFeesV2.deleteMany({
    where: { transactionId: oldTransactionId },
  });
  await prisma.transactionV2.deleteMany({
    where: { transactionId: oldTransactionId },
  });

  const legacy = await prisma.transaction.findUnique({
    where: { transactionId: newTransactionId },
    include: {
      schoolFee: true,
    },
  });
  if (!legacy?.schoolFee) return null;

  const enrollment = await prisma.enrollmentV2.findFirst({
    where: { studentId: legacy.schoolFee.studentId },
  });
  if (!enrollment) return null;

  await prisma.$transaction(async (tx) => {
    await ensureTransactionV2Row(tx, legacy, legacy.schoolFee.paymentType);
    const existingSf = await tx.schoolFeesV2.findUnique({
      where: { transactionId: legacy.transactionId },
    });
    if (!existingSf) {
      await tx.schoolFeesV2.create({
        data: {
          order: legacy.schoolFee.order,
          createdAt: legacy.schoolFee.createdAt,
          updatedAt: legacy.schoolFee.updatedAt,
          deletedAt: legacy.schoolFee.deletedAt,
          transactionId: legacy.transactionId,
          enrollmentId: enrollment.id,
        },
      });
    }
  });

  return prisma.transactionV2.findUnique({ where: { transactionId: newTransactionId } });
}

/**
 * Soft-delete mirror when legacy workspace is soft-deleted (optional hook).
 */
export async function softDeleteV2ForLegacyWorkspace(workspaceId) {
  const now = new Date();
  await prisma.$transaction([
    prisma.studentV2.updateMany({
      where: { id: workspaceId },
      data: { deletedAt: now },
    }),
    prisma.workspaceV2.updateMany({
      where: { workspaceId },
      data: { deletedAt: now },
    }),
  ]);
}
