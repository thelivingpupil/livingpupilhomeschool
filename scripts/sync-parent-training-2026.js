/**
 * Sync SY 2026-2027 parent training rows with each guardian's students
 * (grade level + partner school / DUAL accreditation).
 *
 * - Creates missing expected trainings (restores a soft-deleted row if one exists).
 * - Soft-deletes UNFINISHED trainings that are no longer expected. FINISHED rows are never touched.
 * - Guardians with no SY 2026-2027 student records are skipped.
 *
 * Mirrors syncParentTrainingsForGuardian in prisma/services/parent-training.js.
 *
 * Usage:
 *   node scripts/sync-parent-training-2026.js          # dry run (default)
 *   node scripts/sync-parent-training-2026.js --apply  # write changes
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const SCHOOL_YEAR = '2026-2027';
const APPLY = process.argv.includes('--apply');

const COURSE_PARTNER_SCHOOL = {
  PT26273A: 'KAIROS',
  PT26273B: 'MANDAUE',
  PT26273C: 'KAIROS',
  SHDYB21: 'MANDAUE',
  PT26273D: 'HOMELIFE',
  'Msha712!': 'KAIROS',
  JDwhs18: 'MANDAUE',
};

const PRESCHOOL_KINDER = ['FPT20261', 'FPT20262', 'FPT20264'];
const K2 = [
  'FPT20261',
  'FPT20262',
  'FPT20264',
  'PT26273A',
  'PT26273B',
  'PT26273D',
  'Msha712!',
  'JDwhs18',
];
const formCodes = (foundation) => [
  'FPT20261',
  foundation,
  'FPT20264',
  'PT26273C',
  'SHDYB21',
  'PT26273D',
  'Msha712!',
  'JDwhs18',
];
const FORM_1 = formCodes('FPT20263A');
const FORM_2 = formCodes('FPT20263B');
const FORM_3 = formCodes('FPT20263C');

const PARENT_TRAINING_PER_GRADE_LEVEL = {
  PRESCHOOL: PRESCHOOL_KINDER,
  K1: PRESCHOOL_KINDER,
  K2,
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

const US_PARTNER_SCHOOLS = ['KAIROS', 'MANDAUE'];

const PARTNER_SCHOOL_MEMBERS = {
  KAIROS: ['KAIROS'],
  MANDAUE: ['MANDAUE'],
  HOMELIFE_ACADEMY: ['HOMELIFE_ACADEMY', 'HOMELIFE'],
  HOMELIFE_KAIROS: ['HOMELIFE', 'KAIROS'],
  HOMELIFE_MANDAUE: ['HOMELIFE', 'MANDAUE'],
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

function getUsPartnerSchool(partnerSchool) {
  if (!partnerSchool) return '';
  if (US_PARTNER_SCHOOLS.includes(partnerSchool)) return partnerSchool;
  if (partnerSchool === 'HOMELIFE_KAIROS' || partnerSchool === 'HOMELIFE,KAIROS') {
    return 'KAIROS';
  }
  if (partnerSchool === 'HOMELIFE_MANDAUE' || partnerSchool === 'HOMELIFE,MANDAUE') {
    return 'MANDAUE';
  }
  return '';
}

function getStudentPartnerSchools(studentRecord) {
  const stored = studentRecord.partnerSchool;
  if (PARTNER_SCHOOL_MEMBERS[stored]) return PARTNER_SCHOOL_MEMBERS[stored];

  const usSchool = getUsPartnerSchool(stored);
  if (studentRecord.accreditation === 'DUAL') {
    return usSchool ? ['HOMELIFE', usSchool] : ['HOMELIFE'];
  }
  return usSchool ? [usSchool] : [];
}

function expectedCodesForStudent(studentRecord) {
  const gradeCodes = PARENT_TRAINING_PER_GRADE_LEVEL[studentRecord.incomingGradeLevel] || [];
  const schools = getStudentPartnerSchools(studentRecord);
  return gradeCodes.filter((code) => {
    const required = COURSE_PARTNER_SCHOOL[code];
    if (!required) return true;
    return schools.includes(required);
  });
}

function planSync(expectedCodes, trainings) {
  const expected = new Set(expectedCodes);
  const active = trainings.filter((t) => !t.deletedAt);
  const activeCodes = new Set(active.map((t) => t.courseCode));

  const toCreate = [];
  const toRestore = [];

  for (const courseCode of expectedCodes) {
    if (activeCodes.has(courseCode)) continue;

    const [deleted] = trainings
      .filter((t) => t.deletedAt && t.courseCode === courseCode)
      .sort(
        (a, b) =>
          (b.status === 'FINISHED') - (a.status === 'FINISHED') ||
          new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
      );

    if (deleted) {
      toRestore.push(deleted);
    } else {
      toCreate.push(courseCode);
    }
  }

  const toRemove = active.filter(
    (t) => !expected.has(t.courseCode) && t.status === 'UNFINISHED'
  );

  return { toCreate, toRestore, toRemove };
}

function countBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

async function main() {
  loadEnv();
  const prisma = new PrismaClient();

  console.log(
    APPLY
      ? `APPLYING — SY ${SCHOOL_YEAR} parent training sync`
      : `DRY RUN — SY ${SCHOOL_YEAR} parent training sync (pass --apply to write)`
  );

  try {
    const [students, trainings] = await Promise.all([
      prisma.studentRecord.findMany({
        where: {
          schoolYear: SCHOOL_YEAR,
          deletedAt: null,
          student: { deletedAt: null },
        },
        select: {
          incomingGradeLevel: true,
          accreditation: true,
          partnerSchool: true,
          student: {
            select: {
              creator: {
                select: {
                  guardianInformation: { select: { id: true } },
                },
              },
            },
          },
        },
      }),
      prisma.parentTraining.findMany({
        where: { schoolYear: SCHOOL_YEAR },
        select: {
          id: true,
          guardianId: true,
          courseCode: true,
          status: true,
          deletedAt: true,
          updatedAt: true,
        },
      }),
    ]);

    console.log(`Found ${students.length} student record(s) for ${SCHOOL_YEAR}`);
    console.log(`Found ${trainings.length} parent training row(s) for ${SCHOOL_YEAR} (incl. soft-deleted)`);

    const expectedByGuardian = new Map();
    let skippedNoGuardian = 0;

    for (const record of students) {
      const guardianId = record.student?.creator?.guardianInformation?.id;
      if (!guardianId) {
        skippedNoGuardian += 1;
        continue;
      }
      if (!expectedByGuardian.has(guardianId)) {
        expectedByGuardian.set(guardianId, new Set());
      }
      expectedCodesForStudent(record).forEach((code) =>
        expectedByGuardian.get(guardianId).add(code)
      );
    }

    const trainingsByGuardian = new Map();
    for (const row of trainings) {
      if (!trainingsByGuardian.has(row.guardianId)) {
        trainingsByGuardian.set(row.guardianId, []);
      }
      trainingsByGuardian.get(row.guardianId).push(row);
    }

    const guardiansWithoutStudents = [...trainingsByGuardian.keys()].filter(
      (guardianId) => !expectedByGuardian.has(guardianId)
    );

    const toCreate = [];
    const toRestore = [];
    const toRemove = [];

    for (const [guardianId, expected] of expectedByGuardian) {
      const plan = planSync([...expected], trainingsByGuardian.get(guardianId) || []);
      if (!plan.toCreate.length && !plan.toRestore.length && !plan.toRemove.length) continue;

      const parts = [];
      if (plan.toCreate.length) parts.push(`create [${plan.toCreate.join(', ')}]`);
      if (plan.toRestore.length) {
        parts.push(
          `restore [${plan.toRestore.map((t) => `${t.courseCode}(${t.status})`).join(', ')}]`
        );
      }
      if (plan.toRemove.length) {
        parts.push(`soft-delete [${plan.toRemove.map((t) => t.courseCode).join(', ')}]`);
      }
      console.log(`  guardian ${guardianId.slice(0, 8)}…: ${parts.join('; ')}`);

      plan.toCreate.forEach((courseCode) => toCreate.push({ courseCode, guardianId }));
      toRestore.push(...plan.toRestore);
      toRemove.push(...plan.toRemove);
    }

    console.log(
      JSON.stringify(
        {
          guardiansWithStudents: expectedByGuardian.size,
          skippedStudentsNoGuardian: skippedNoGuardian,
          skippedGuardiansWithoutStudents: guardiansWithoutStudents.length,
          create: toCreate.length,
          createByCode: countBy(toCreate, (row) => row.courseCode),
          restore: toRestore.length,
          restoreByCode: countBy(toRestore, (row) => row.courseCode),
          softDelete: toRemove.length,
          softDeleteByCode: countBy(toRemove, (row) => row.courseCode),
        },
        null,
        2
      )
    );

    if (!APPLY || (!toCreate.length && !toRestore.length && !toRemove.length)) {
      return;
    }

    let created = 0;
    for (const { courseCode, guardianId } of toCreate) {
      const existing = await prisma.parentTraining.findFirst({
        where: { courseCode, guardianId, schoolYear: SCHOOL_YEAR },
        select: { id: true },
      });
      if (existing) continue;
      await prisma.parentTraining.create({
        data: { courseCode, guardianId, schoolYear: SCHOOL_YEAR, status: 'UNFINISHED' },
      });
      created += 1;
    }

    const restored = toRestore.length
      ? (
          await prisma.parentTraining.updateMany({
            where: { id: { in: toRestore.map((row) => row.id) } },
            data: { deletedAt: null },
          })
        ).count
      : 0;

    const removed = toRemove.length
      ? (
          await prisma.parentTraining.updateMany({
            where: {
              id: { in: toRemove.map((row) => row.id) },
              status: 'UNFINISHED',
              deletedAt: null,
            },
            data: { deletedAt: new Date() },
          })
        ).count
      : 0;

    console.log(`Done. Created ${created}, restored ${restored}, soft-deleted ${removed} row(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
