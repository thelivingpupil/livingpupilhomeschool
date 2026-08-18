/**
 * Bulk-assign partnerSchool on studentRecord from Kairos / Mandaue CSVs.
 *
 * Usage:
 *   node scripts/assign-partner-schools.js \
 *     --kairos "/path/to/kairos.csv" \
 *     --mandaue "/path/to/mandaue.csv" \
 *     [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { PrismaClient } = require('@prisma/client');

// Load .env without dotenv dependency
(() => {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) return;
    for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch (_) {}
})();

const prisma = new PrismaClient();

function parseArgs(argv) {
  const args = { dryRun: false, kairos: null, mandaue: null };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--kairos') args.kairos = argv[++i];
    else if (arg === '--mandaue') args.mandaue = argv[++i];
  }
  return args;
}

function normalize(value) {
  return String(value || '')
    .replace(/[\r\n\u200b]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function pickField(row, candidates) {
  const entries = Object.entries(row || {});
  for (const candidate of candidates) {
    const match = entries.find(
      ([key]) => normalize(key) === normalize(candidate),
    );
    if (match && match[1] != null && String(match[1]).trim() !== '') {
      return String(match[1]).replace(/[\r\n\u200b]/g, '').trim();
    }
  }
  for (const candidate of candidates) {
    const match = entries.find(([key]) =>
      normalize(key).includes(normalize(candidate)),
    );
    if (match && match[1] != null && String(match[1]).trim() !== '') {
      return String(match[1]).replace(/[\r\n\u200b]/g, '').trim();
    }
  }
  return '';
}

function parseCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = Papa.parse(content, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => String(h || '').trim(),
  });
  if (parsed.errors?.length) {
    console.warn(
      `CSV parse warnings for ${filePath}:`,
      parsed.errors.slice(0, 5),
    );
  }
  return parsed.data || [];
}

function rowsFromCsv(filePath, partnerSchool) {
  return parseCsv(filePath)
    .map((row) => {
      const firstName = pickField(row, ['First Name', 'FirstName']);
      const lastName = pickField(row, ['Last Name', 'LastName']);
      const email = pickField(row, [
        'Primary Email Address',
        'Primary Email',
        'Account Email',
        'Email',
      ]);
      return { firstName, lastName, email, partnerSchool };
    })
    .filter((r) => r.firstName && r.lastName && r.email);
}

function matchKey(email, firstName, lastName) {
  return `${normalize(email)}|${normalize(firstName)}|${normalize(lastName)}`;
}

function pickTarget(matches) {
  if (matches.length === 1) return { target: matches[0], ambiguous: false };
  const currentYear = matches.filter((m) => m.schoolYear === '2026-2027');
  if (currentYear.length === 1) {
    return { target: currentYear[0], ambiguous: false };
  }
  return { target: null, ambiguous: true };
}

async function loadStudentIndex() {
  console.log('Loading student records from database...');
  const records = await prisma.studentRecord.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      partnerSchool: true,
      schoolYear: true,
      student: {
        select: {
          deletedAt: true,
          creator: { select: { email: true } },
        },
      },
    },
  });

  const index = new Map();
  let skipped = 0;
  for (const record of records) {
    if (record.student?.deletedAt) {
      skipped += 1;
      continue;
    }
    const email = record.student?.creator?.email;
    if (!email) {
      skipped += 1;
      continue;
    }
    const key = matchKey(email, record.firstName, record.lastName);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(record);
  }

  console.log(
    `Loaded ${records.length} student records (${index.size} unique email+name keys, skipped ${skipped})`,
  );
  return index;
}

function assignFromRows(rows, index, dryRun, updates) {
  const stats = {
    total: rows.length,
    updated: 0,
    alreadySet: 0,
    unmatched: 0,
    ambiguous: 0,
  };
  const unmatchedSamples = [];
  const ambiguousSamples = [];

  for (const row of rows) {
    const key = matchKey(row.email, row.firstName, row.lastName);
    const matches = index.get(key) || [];

    if (matches.length === 0) {
      stats.unmatched += 1;
      if (unmatchedSamples.length < 20) {
        unmatchedSamples.push(`${row.firstName} ${row.lastName} <${row.email}>`);
      }
      continue;
    }

    const { target, ambiguous } = pickTarget(matches);
    if (ambiguous || !target) {
      stats.ambiguous += 1;
      if (ambiguousSamples.length < 20) {
        ambiguousSamples.push(
          `${row.firstName} ${row.lastName} <${row.email}> (${matches.length} matches)`,
        );
      }
      continue;
    }

    if (target.partnerSchool === row.partnerSchool) {
      stats.alreadySet += 1;
      continue;
    }

    updates.push({ id: target.id, partnerSchool: row.partnerSchool });
    // Keep in-memory index in sync for later CSV files
    target.partnerSchool = row.partnerSchool;
    stats.updated += 1;
  }

  return { stats, unmatchedSamples, ambiguousSamples };
}

async function applyUpdates(updates, dryRun) {
  if (dryRun || updates.length === 0) return;

  const BATCH = 50;
  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH);
    await prisma.$transaction(
      batch.map((u) =>
        prisma.studentRecord.update({
          where: { id: u.id },
          data: { partnerSchool: u.partnerSchool },
        }),
      ),
    );
    console.log(`Updated ${Math.min(i + BATCH, updates.length)} / ${updates.length}`);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.kairos || !args.mandaue) {
    console.error(
      'Usage: node scripts/assign-partner-schools.js --kairos <file> --mandaue <file> [--dry-run]',
    );
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL || '';
  const dbHost = dbUrl.match(/@([^/:]+)/)?.[1] || '(unknown host)';
  console.log(`Database host: ${dbHost}`);
  console.log(`Mode: ${args.dryRun ? 'DRY RUN' : 'WRITE'}`);

  const kairosRows = rowsFromCsv(args.kairos, 'KAIROS');
  const mandaueRows = rowsFromCsv(args.mandaue, 'MANDAUE');
  console.log(`Kairos CSV rows with name+email: ${kairosRows.length}`);
  console.log(`Mandaue CSV rows with name+email: ${mandaueRows.length}`);

  const index = await loadStudentIndex();
  const updates = [];

  console.log('\n--- Kairos ---');
  const kairosResult = assignFromRows(kairosRows, index, args.dryRun, updates);
  console.log(kairosResult.stats);
  if (kairosResult.unmatchedSamples.length) {
    console.log('Unmatched samples:', kairosResult.unmatchedSamples);
  }
  if (kairosResult.ambiguousSamples.length) {
    console.log('Ambiguous samples:', kairosResult.ambiguousSamples);
  }

  console.log('\n--- Mandaue ---');
  const mandaueResult = assignFromRows(
    mandaueRows,
    index,
    args.dryRun,
    updates,
  );
  console.log(mandaueResult.stats);
  if (mandaueResult.unmatchedSamples.length) {
    console.log('Unmatched samples:', mandaueResult.unmatchedSamples);
  }
  if (mandaueResult.ambiguousSamples.length) {
    console.log('Ambiguous samples:', mandaueResult.ambiguousSamples);
  }

  console.log(`\nApplying ${updates.length} updates...`);
  await applyUpdates(updates, args.dryRun);

  console.log(
    `\nDone. ${args.dryRun ? 'Would update' : 'Updated'}: ${updates.length}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
