/**
 * Soft-delete SY 2026-2027 school-specific parent trainings that do not
 * match any of the guardian's students' partner schools / grade levels.
 *
 * Leaves core lessons (FPT2026*) alone.
 * Also removes school-specific rows when the guardian has no partner school.
 *
 * Usage:
 *   node scripts/cleanup-parent-training-partner-school.js --dry-run
 *   node scripts/cleanup-parent-training-partner-school.js
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const SCHOOL_YEAR = '2026-2027';
const DRY_RUN = process.argv.includes('--dry-run');

const COURSE_PARTNER_SCHOOL = {
  PT26273A: 'KAIROS',
  PT26273B: 'MANDAUE',
  PT26273C: 'KAIROS',
  SHDYB21: 'MANDAUE',
  PT26273D: 'HOMELIFE',
  'Msha712!': 'KAIROS',
  JDwhs18: 'MANDAUE',
};

const SCHOOL_SPECIFIC_CODES = Object.keys(COURSE_PARTNER_SCHOOL);

const PARTNER_SCHOOL_MEMBERS = {
  KAIROS: ['KAIROS'],
  MANDAUE: ['MANDAUE'],
  HOMELIFE_ACADEMY: ['HOMELIFE_ACADEMY', 'HOMELIFE'],
  HOMELIFE: ['HOMELIFE_ACADEMY', 'HOMELIFE'],
  HOMELIFE_KAIROS: ['HOMELIFE', 'KAIROS'],
  HOMELIFE_MANDAUE: ['HOMELIFE', 'MANDAUE'],
};

const GRADE_CODES = {
  PRESCHOOL: ['FPT20261', 'FPT20262', 'FPT20264'],
  K1: ['FPT20261', 'FPT20262', 'FPT20264'],
  K2: [
    'FPT20261',
    'FPT20262',
    'FPT20264',
    'PT26273A',
    'PT26273B',
    'PT26273D',
    'Msha712!',
    'JDwhs18',
  ],
  GRADE_1: [
    'FPT20261',
    'FPT20263A',
    'FPT20264',
    'PT26273C',
    'SHDYB21',
    'PT26273D',
    'Msha712!',
    'JDwhs18',
  ],
  GRADE_2: [
    'FPT20261',
    'FPT20263A',
    'FPT20264',
    'PT26273C',
    'SHDYB21',
    'PT26273D',
    'Msha712!',
    'JDwhs18',
  ],
  GRADE_3: [
    'FPT20261',
    'FPT20263A',
    'FPT20264',
    'PT26273C',
    'SHDYB21',
    'PT26273D',
    'Msha712!',
    'JDwhs18',
  ],
  GRADE_4: [
    'FPT20261',
    'FPT20263B',
    'FPT20264',
    'PT26273C',
    'SHDYB21',
    'PT26273D',
    'Msha712!',
    'JDwhs18',
  ],
  GRADE_5: [
    'FPT20261',
    'FPT20263B',
    'FPT20264',
    'PT26273C',
    'SHDYB21',
    'PT26273D',
    'Msha712!',
    'JDwhs18',
  ],
  GRADE_6: [
    'FPT20261',
    'FPT20263B',
    'FPT20264',
    'PT26273C',
    'SHDYB21',
    'PT26273D',
    'Msha712!',
    'JDwhs18',
  ],
  GRADE_7: [
    'FPT20261',
    'FPT20263C',
    'FPT20264',
    'PT26273C',
    'SHDYB21',
    'PT26273D',
    'Msha712!',
    'JDwhs18',
  ],
  GRADE_8: [
    'FPT20261',
    'FPT20263C',
    'FPT20264',
    'PT26273C',
    'SHDYB21',
    'PT26273D',
    'Msha712!',
    'JDwhs18',
  ],
  GRADE_9: [
    'FPT20261',
    'FPT20263C',
    'FPT20264',
    'PT26273C',
    'SHDYB21',
    'PT26273D',
    'Msha712!',
    'JDwhs18',
  ],
  GRADE_10: [
    'FPT20261',
    'FPT20263C',
    'FPT20264',
    'PT26273C',
    'SHDYB21',
    'PT26273D',
    'Msha712!',
    'JDwhs18',
  ],
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

function studentSchools(partnerSchool) {
  return PARTNER_SCHOOL_MEMBERS[partnerSchool] || [];
}

function allowedCodesForStudent(gradeLevel, partnerSchool) {
  const gradeCodes = GRADE_CODES[gradeLevel] || [];
  const schools = studentSchools(partnerSchool);
  return gradeCodes.filter((code) => {
    const required = COURSE_PARTNER_SCHOOL[code];
    if (!required) return true;
    return schools.includes(required);
  });
}

function countBy(rows, keyFn) {
  return rows.reduce((acc, row) => {
    const key = keyFn(row);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

async function main() {
  loadEnv();
  const prisma = new PrismaClient();

  console.log(
    DRY_RUN
      ? `DRY RUN — soft-delete unmatched school-specific trainings for SY ${SCHOOL_YEAR}`
      : `APPLYING — soft-delete unmatched school-specific trainings for SY ${SCHOOL_YEAR}`
  );

  try {
    const [trainings, students] = await Promise.all([
      prisma.parentTraining.findMany({
        where: {
          schoolYear: SCHOOL_YEAR,
          deletedAt: null,
          courseCode: { in: SCHOOL_SPECIFIC_CODES },
        },
        select: {
          id: true,
          guardianId: true,
          courseCode: true,
          status: true,
        },
      }),
      prisma.studentRecord.findMany({
        where: {
          schoolYear: SCHOOL_YEAR,
          deletedAt: null,
          student: { deletedAt: null },
        },
        select: {
          incomingGradeLevel: true,
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
    ]);

    const allowedByGuardian = new Map();
    const guardiansWithPartnerSchool = new Set();

    for (const student of students) {
      const guardianId = student.student?.creator?.guardianInformation?.id;
      if (!guardianId) continue;

      if (!allowedByGuardian.has(guardianId)) {
        allowedByGuardian.set(guardianId, new Set());
      }

      if (student.partnerSchool) {
        guardiansWithPartnerSchool.add(guardianId);
      }

      allowedCodesForStudent(student.incomingGradeLevel, student.partnerSchool).forEach(
        (code) => allowedByGuardian.get(guardianId).add(code)
      );
    }

    const toRemove = [];
    const noPartnerSchool = [];
    const kept = [];

    for (const row of trainings) {
      if (!guardiansWithPartnerSchool.has(row.guardianId)) {
        noPartnerSchool.push(row);
        toRemove.push(row);
        continue;
      }

      const allowed = allowedByGuardian.get(row.guardianId) || new Set();
      if (allowed.has(row.courseCode)) {
        kept.push(row);
      } else {
        toRemove.push(row);
      }
    }

    console.log(
      JSON.stringify(
        {
          schoolSpecificRows: trainings.length,
          guardiansWithPartnerSchool: guardiansWithPartnerSchool.size,
          keep: kept.length,
          noPartnerSchool: noPartnerSchool.length,
          remove: toRemove.length,
          removeByCode: countBy(toRemove, (row) => row.courseCode),
          removeByStatus: countBy(toRemove, (row) => row.status),
          noPartnerSchoolByCode: countBy(noPartnerSchool, (row) => row.courseCode),
        },
        null,
        2
      )
    );

    if (DRY_RUN || toRemove.length === 0) {
      return;
    }

    const now = new Date();
    const BATCH_SIZE = 500;
    let updated = 0;
    for (let i = 0; i < toRemove.length; i += BATCH_SIZE) {
      const ids = toRemove.slice(i, i + BATCH_SIZE).map((row) => row.id);
      const result = await prisma.parentTraining.updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: now },
      });
      updated += result.count;
      console.log(`Soft-deleted batch ${i / BATCH_SIZE + 1}: ${result.count} row(s)`);
    }

    console.log(`Done. Soft-deleted ${updated} parent training row(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
