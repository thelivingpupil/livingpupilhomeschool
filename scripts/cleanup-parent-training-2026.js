/**
 * Delete SY 2026-2027 parent training rows that are not in the FPT2026 course set.
 *
 * Usage:
 *   node scripts/cleanup-parent-training-2026.js --dry-run
 *   node scripts/cleanup-parent-training-2026.js
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const SCHOOL_YEAR = '2026-2027';
const KEEP_CODES = [
  'FPT20261',
  'FPT20262',
  'FPT20263A',
  'FPT20263B',
  'FPT20263C',
  'FPT20264',
];
const DRY_RUN = process.argv.includes('--dry-run');

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

async function main() {
  loadEnv();
  const prisma = new PrismaClient();

  console.log(
    DRY_RUN
      ? `DRY RUN — remove non-FPT parent trainings for SY ${SCHOOL_YEAR}`
      : `APPLYING — remove non-FPT parent trainings for SY ${SCHOOL_YEAR}`
  );

  try {
    const where = {
      schoolYear: SCHOOL_YEAR,
      courseCode: { notIn: KEEP_CODES },
    };

    const toDelete = await prisma.parentTraining.findMany({
      where,
      select: { id: true, courseCode: true, status: true },
    });

    const byCode = toDelete.reduce((acc, row) => {
      acc[row.courseCode] = (acc[row.courseCode] || 0) + 1;
      return acc;
    }, {});

    console.log(`Rows to delete: ${toDelete.length}`);
    console.log('By courseCode:', byCode);

    if (DRY_RUN || toDelete.length === 0) {
      return;
    }

    const result = await prisma.parentTraining.deleteMany({ where });
    console.log(`Deleted ${result.count} parent training row(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
