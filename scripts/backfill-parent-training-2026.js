/**
 * Backfill FPT2026 parent training rows for guardians with SY 2026-2027 student records.
 *
 * Usage:
 *   node scripts/backfill-parent-training-2026.js           # apply
 *   node scripts/backfill-parent-training-2026.js --dry-run  # preview only
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const SCHOOL_YEAR = '2026-2027';
const DRY_RUN = process.argv.includes('--dry-run');

const PRESCHOOL_KINDER = ['FPT20261', 'FPT20262', 'FPT20264'];
const FORM_1 = ['FPT20261', 'FPT20263A', 'FPT20264'];
const FORM_2 = ['FPT20261', 'FPT20263B', 'FPT20264'];
const FORM_3 = ['FPT20261', 'FPT20263C', 'FPT20264'];

const PARENT_TRAINING_PER_GRADE_LEVEL = {
  PRESCHOOL: PRESCHOOL_KINDER,
  K1: PRESCHOOL_KINDER,
  K2: PRESCHOOL_KINDER,
  GRADE_1: FORM_1,
  GRADE_2: FORM_1,
  GRADE_3: FORM_1,
  GRADE_4: FORM_2,
  GRADE_5: FORM_2,
  GRADE_6: FORM_2,
  GRADE_7: FORM_3,
  GRADE_8: FORM_3,
  GRADE_9: FORM_3,
  GRADE_10: FORM_3,
  GRADE_11: [],
  GRADE_12: [],
};

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

function trainingKey(guardianId, courseCode) {
  return `${guardianId}::${courseCode}`;
}

async function main() {
  loadEnv();
  const prisma = new PrismaClient();

  console.log(
    DRY_RUN
      ? `DRY RUN — SY ${SCHOOL_YEAR} parent training backfill`
      : `APPLYING — SY ${SCHOOL_YEAR} parent training backfill`
  );

  try {
    const [students, existingTrainings] = await Promise.all([
      prisma.studentRecord.findMany({
        where: {
          schoolYear: SCHOOL_YEAR,
          deletedAt: null,
          student: { deletedAt: null },
        },
        select: {
          incomingGradeLevel: true,
          student: {
            select: {
              slug: true,
              creator: {
                select: {
                  email: true,
                  guardianInformation: { select: { id: true } },
                },
              },
            },
          },
        },
      }),
      prisma.parentTraining.findMany({
        where: { schoolYear: SCHOOL_YEAR },
        select: { guardianId: true, courseCode: true },
      }),
    ]);

    console.log(`Found ${students.length} student record(s) for ${SCHOOL_YEAR}`);
    console.log(`Found ${existingTrainings.length} existing parent training row(s) for ${SCHOOL_YEAR}`);

    const existing = new Set(
      existingTrainings.map((t) => trainingKey(t.guardianId, t.courseCode))
    );

    const toCreateMap = new Map();
    let skippedNoGuardian = 0;
    let skippedNoCourses = 0;
    let skippedExisting = 0;
    const guardianGradePairs = new Set();

    for (const record of students) {
      const guardianId = record.student?.creator?.guardianInformation?.id;
      const gradeLevel = record.incomingGradeLevel;

      if (!guardianId) {
        skippedNoGuardian += 1;
        continue;
      }

      const pairKey = `${guardianId}:${gradeLevel}`;
      if (guardianGradePairs.has(pairKey)) continue;
      guardianGradePairs.add(pairKey);

      const courseCodes = PARENT_TRAINING_PER_GRADE_LEVEL[gradeLevel] || [];
      if (courseCodes.length === 0) {
        skippedNoCourses += 1;
        continue;
      }

      for (const courseCode of courseCodes) {
        const key = trainingKey(guardianId, courseCode);
        if (existing.has(key) || toCreateMap.has(key)) {
          skippedExisting += 1;
          continue;
        }

        toCreateMap.set(key, {
          courseCode,
          guardianId,
          schoolYear: SCHOOL_YEAR,
          status: 'UNFINISHED',
        });
      }
    }

    const toCreate = Array.from(toCreateMap.values());
    console.log(`Guardians+grades processed: ${guardianGradePairs.size}`);
    console.log(`${DRY_RUN ? 'Would create' : 'Creating'}: ${toCreate.length}`);
    console.log(`Skipped (already exists / duplicate): ${skippedExisting}`);
    console.log(`Skipped (no guardian): ${skippedNoGuardian}`);
    console.log(`Skipped (no courses for grade): ${skippedNoCourses}`);

    if (DRY_RUN || toCreate.length === 0) {
      return;
    }

    const BATCH_SIZE = 500;
    let created = 0;
    for (let i = 0; i < toCreate.length; i += BATCH_SIZE) {
      const batch = toCreate.slice(i, i + BATCH_SIZE);
      const result = await prisma.parentTraining.createMany({ data: batch });
      created += result.count;
      console.log(`Inserted batch ${i / BATCH_SIZE + 1}: ${result.count} row(s)`);
    }

    console.log(`Done. Created ${created} parent training row(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
