/**
 * Migrates legacy Workspace + StudentRecord + SchoolFee/Transaction rows into
 * StudentV2, WorkspaceV2, EnrollmentV2, SchoolYearV2, TransactionV2, SchoolFeesV2.
 *
 * Idempotency: StudentV2.studentId = legacy Workspace.id. Re-running skips workspaces
 * that already have a StudentV2 with that studentId.
 *
 * Usage:
 *   npx dotenv-cli -e .env --override -- node scripts/migrate-legacy-to-v2.js
 *   npx dotenv-cli -e .env --override -- node scripts/migrate-legacy-to-v2.js --dry-run
 *   npx dotenv-cli -e .env --override -- node scripts/migrate-legacy-to-v2.js --limit 5
 *   npx dotenv-cli -e .env --override -- node scripts/migrate-legacy-to-v2.js --workspace-id <cuid>
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function parseArgs() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  let limit = null;
  const li = argv.indexOf('--limit');
  if (li !== -1 && argv[li + 1]) {
    limit = parseInt(argv[li + 1], 10);
    if (Number.isNaN(limit)) limit = null;
  }
  let workspaceId = null;
  const wi = argv.indexOf('--workspace-id');
  if (wi !== -1 && argv[wi + 1]) {
    workspaceId = argv[wi + 1];
  }
  return { dryRun, limit, workspaceId };
}

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

async function ensureSchoolYearId(tx, schoolYearLabel, createdById) {
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

async function ensureTransactionV2(tx, legacy, schoolFeePaymentType) {
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

async function migrateOneWorkspace(workspace, dryRun) {
  const record = workspace.studentRecord;
  if (!record) {
    return { skipped: true, reason: 'no studentRecord' };
  }

  const existingStudent = await prisma.studentV2.findUnique({
    where: { studentId: workspace.id },
  });
  if (existingStudent) {
    return { skipped: true, reason: 'already migrated (StudentV2 exists)' };
  }

  if (dryRun) {
    console.log(
      `  [dry-run] would migrate workspace ${workspace.id} (${workspace.slug})`
    );
    return { ok: true, dryRun: true };
  }

  const creatorId = workspace.creatorId;
  const enrollmentType = mapEnrollmentType(record.enrollmentType);
  const enrollmentStatus = mapEnrollmentStatus(record.studentStatus);

  await prisma.$transaction(async (tx) => {
    const schoolYearId = await ensureSchoolYearId(
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

      await ensureTransactionV2(tx, legacyTx, fee.paymentType);

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

  return { ok: true };
}

async function main() {
  const { dryRun, limit, workspaceId } = parseArgs();

  const where = {
    deletedAt: null,
    studentRecord: { isNot: null },
    ...(workspaceId ? { id: workspaceId } : {}),
  };

  let workspaces = await prisma.workspace.findMany({
    where,
    include: {
      studentRecord: true,
      schoolFees: {
        include: { transaction: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (limit != null) {
    workspaces = workspaces.slice(0, limit);
  }

  console.log(
    `migrate-legacy-to-v2: ${workspaces.length} workspace(s), dryRun=${dryRun}`
  );

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const ws of workspaces) {
    try {
      const result = await migrateOneWorkspace(ws, dryRun);
      if (result.skipped) {
        skipped += 1;
        console.log(`- skip ${ws.id}: ${result.reason}`);
      } else if (result.ok) {
        ok += 1;
        if (!dryRun) console.log(`+ migrated ${ws.id} (${ws.slug})`);
      }
    } catch (e) {
      failed += 1;
      console.error(`! failed ${ws.id}:`, e.message);
    }
  }

  console.log(`Done. ok=${ok}, skipped=${skipped}, failed=${failed}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
