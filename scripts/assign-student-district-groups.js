/**
 * Assign 2026-2027 StudentRecord.district from the saved address.
 *
 * Usage:
 *   node scripts/assign-student-district-groups.js
 *   node scripts/assign-student-district-groups.js --apply
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

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

const SCHOOL_YEAR = '2026-2027';
const prisma = new PrismaClient();

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const setOf = (names) => new Set(names.map(normalize));

const CEBU_SOUTH = setOf([
  'talisay',
  'talisay city',
  'city of talisay',
  'minglanilla',
  'naga',
  'naga city',
  'san fernando',
  'carcar',
  'carcar city',
  'sibonga',
  'argao',
  'toledo',
  'toledo city',
]);
const CEBU_NORTH = setOf([
  'mandaue',
  'mandaue city',
  'lapu lapu',
  'lapu lapu city',
  'lapulapu',
  'consolacion',
  'liloan',
  'compostela',
  'danao',
  'danao city',
  'carmen',
  'catmon',
  'sogod',
  'borbon',
  'tabogon',
  'bogo',
  'bogo city',
  'medellin',
  'daanbantayan',
]);
const CEBU_CENTRAL = setOf(['cebu city', 'city of cebu']);
const BAYANI_CITIES = setOf([
  'quezon city',
  'marikina',
  'marikina city',
  'caloocan',
  'caloocan city',
  'valenzuela',
  'valenzuela city',
  'manila',
  'city of manila',
  'san juan',
  'san juan city',
]);
const MAGITING_CITIES = setOf([
  'pasig',
  'pasig city',
  'city of pasig',
  'mandaluyong',
  'mandaluyong city',
  'makati',
  'makati city',
  'taguig',
  'taguig city',
  'pasay',
  'pasay city',
  'paranaque',
  'paranaque city',
  'las pinas',
  'las pinas city',
  'muntinlupa',
  'muntinlupa city',
]);

const PROVINCE_DISTRICT = [
  ['rizal', 'BAYANI'],
  ['cavite', 'MAHARLIKA'],
  ['laguna', 'MAHARLIKA'],
  ['batangas', 'MAHARLIKA'],
  ['quezon', 'MAHARLIKA'],
  ['bulacan', 'BULACAN'],
  ['pampanga', 'MARANGAL'],
  ['zambales', 'MARANGAL'],
  ['bataan', 'MARANGAL'],
  ['nueva ecija', 'MARANGAL'],
  ['tarlac', 'MARANGAL'],
  ['benguet', 'MASINAG'],
  ['la union', 'MASINAG'],
  ['albay', 'BICOL'],
  ['camarines norte', 'BICOL'],
  ['camarines sur', 'BICOL'],
  ['catanduanes', 'BICOL'],
  ['masbate', 'BICOL'],
  ['sorsogon', 'BICOL'],
  ['iloilo', 'ILOILO'],
  ['bohol', 'BOHOL'],
  ['negros occidental', 'NEGROS'],
  ['negros oriental', 'NEGROS'],
  ['leyte', 'LEYTE'],
  ['southern leyte', 'LEYTE'],
  ['biliran', 'LEYTE'],
  ['misamis occidental', 'MISAMIS_OCCIDENTAL'],
  ['bukidnon', 'BUKIDNON_CDO'],
  ['misamis oriental', 'ILIGAN_MISAMIS_ORIENTAL'],
  ['south cotabato', 'SOCCSKSARGEN'],
  ['north cotabato', 'SOCCSKSARGEN'],
  ['cotabato', 'SOCCSKSARGEN'],
  ['sarangani', 'SOCCSKSARGEN'],
  ['sultan kudarat', 'SOCCSKSARGEN'],
];

const VISAYAS_CATCHALL = [
  'capiz',
  'aklan',
  'antique',
  'samar',
  'northern samar',
  'eastern samar',
  'western samar',
  'siquijor',
  'guimaras',
];

const hasName = (keys, name) =>
  keys.some((key) => key === name || key.startsWith(`${name} `));

const hasCity = (keys, cities) => keys.some((key) => cities.has(key));

const classifyKeys = (keys) => {
  if (hasName(keys, 'cebu')) {
    if (hasCity(keys, CEBU_SOUTH)) return 'CEBU_SOUTH';
    if (hasCity(keys, CEBU_NORTH)) return 'CEBU_NORTH';
    if (hasCity(keys, CEBU_CENTRAL)) return 'CEBU_CENTRAL';
    return 'CEBU_VISAYAS';
  }
  if (hasCity(keys, CEBU_CENTRAL)) return 'CEBU_CENTRAL';
  if (
    hasCity(
      keys,
      setOf(['mandaue', 'mandaue city', 'lapu lapu', 'lapu lapu city', 'consolacion', 'liloan', 'minglanilla', 'carcar', 'carcar city']),
    )
  ) {
    return hasCity(keys, setOf(['minglanilla', 'carcar', 'carcar city']))
      ? 'CEBU_SOUTH'
      : 'CEBU_NORTH';
  }

  if (hasCity(keys, new Set(['cagayan de oro', 'cagayan de oro city']))) {
    return 'BUKIDNON_CDO';
  }
  if (hasCity(keys, new Set(['general santos', 'general santos city', 'gensan']))) {
    return 'SOCCSKSARGEN';
  }
  if (hasCity(keys, new Set(['iligan', 'iligan city']))) {
    return 'ILIGAN_MISAMIS_ORIENTAL';
  }
  if (hasCity(keys, new Set(['zamboanga city', 'zamboanga']))) return 'ZAMBOANGA';
  if (hasCity(keys, new Set(['davao city', 'city of davao']))) return 'DAVAO';
  if (hasCity(keys, new Set(['baguio', 'baguio city']))) return 'MASINAG';

  if (hasCity(keys, BAYANI_CITIES)) return 'BAYANI';
  if (hasCity(keys, MAGITING_CITIES)) return 'MAGITING';

  for (const [province, district] of PROVINCE_DISTRICT) {
    if (hasName(keys, province)) return district;
  }

  if (keys.some((key) => key.startsWith('davao'))) return 'DAVAO';
  if (keys.some((key) => key.startsWith('zamboanga'))) return 'ZAMBOANGA';
  if (hasName(keys, 'ncr') || hasName(keys, 'metro manila')) return 'GREATER_MANILA';
  if (hasName(keys, 'compostela valley') || hasName(keys, 'davao de oro')) {
    return 'DAVAO';
  }
  if (
    [
      'agusan del norte',
      'agusan del sur',
      'surigao del norte',
      'surigao del sur',
      'dinagat islands',
      'lanao del norte',
      'lanao del sur',
      'maguindanao',
      'basilan',
      'sulu',
      'tawi tawi',
      'camiguin',
    ].some((province) => hasName(keys, province))
  ) {
    return 'MINDANAO';
  }

  if (VISAYAS_CATCHALL.some((province) => hasName(keys, province))) {
    return 'CEBU_VISAYAS';
  }

  return null;
};

const locationParts = (address) =>
  String(address || '')
    .split(',')
    .map((part) => normalize(part))
    .filter((part) => part && part !== 'null' && part !== 'undefined' && !/^\d{4}$/.test(part));

const classifyAddress = (address2, address1) => {
  const primary = locationParts(address2);
  const fromPrimary = classifyKeys(primary);
  if (fromPrimary) return { district: fromPrimary, source: 'address2', keys: primary };
  const secondary = locationParts(address1);
  const fromSecondary = classifyKeys(secondary);
  if (fromSecondary) {
    return { district: fromSecondary, source: 'address1', keys: secondary };
  }
  return { district: null, source: null, keys: primary.length ? primary : secondary };
};

async function main() {
  const apply = process.argv.includes('--apply');
  const students = await prisma.studentRecord.findMany({
    where: { deletedAt: null, schoolYear: SCHOOL_YEAR },
    select: {
      id: true,
      studentAddress1: true,
      studentAddress2: true,
      isInternationalAddress: true,
      district: true,
    },
  });

  const counts = new Map();
  const unmatched = new Map();
  const updates = [];
  let abroad = 0;

  for (const student of students) {
    if (student.isInternationalAddress) {
      abroad += 1;
      continue;
    }
    const result = classifyAddress(
      student.studentAddress2,
      student.studentAddress1,
    );
    if (!result.district) {
      const token = result.keys[result.keys.length - 1] || '(blank)';
      if (!unmatched.has(token)) unmatched.set(token, []);
      const bucket = unmatched.get(token);
      if (bucket.length < 2) {
        bucket.push(student.studentAddress2 || student.studentAddress1 || '(no address)');
      }
      unmatched.set(token, bucket);
      counts.set(token, (counts.get(`unmatched:${token}`) || 0));
      const key = `unmatched:${token}`;
      counts.set(key, (counts.get(key) || 0) + 1);
      continue;
    }
    counts.set(result.district, (counts.get(result.district) || 0) + 1);
    updates.push({ id: student.id, district: result.district });
  }

  console.log(`${apply ? 'Applying' : 'Mock'} district groups for ${SCHOOL_YEAR}.`);
  console.log(`Students: ${students.length}`);
  console.log(`Abroad, left blank: ${abroad}`);
  console.log(`Would assign: ${updates.length}`);
  console.log('\nGroups:');
  for (const [district, count] of [...counts.entries()]
    .filter(([key]) => !key.startsWith('unmatched:'))
    .sort((a, b) => b[1] - a[1])) {
    console.log(`  ${count}\t${district}`);
  }
  const unmatchedEntries = [...counts.entries()].filter(([key]) =>
    key.startsWith('unmatched:'),
  );
  console.log(`\nLeft blank: ${unmatchedEntries.reduce((sum, [, count]) => sum + count, 0)}`);
  for (const [key, count] of unmatchedEntries.sort((a, b) => b[1] - a[1])) {
    const token = key.replace('unmatched:', '');
    console.log(`  ${count}\t${token}`);
    for (const sample of unmatched.get(token) || []) console.log(`    ${sample}`);
  }

  if (!apply) return;

  const byDistrict = new Map();
  for (const update of updates) {
    if (!byDistrict.has(update.district)) byDistrict.set(update.district, []);
    byDistrict.get(update.district).push(update.id);
  }
  const allowed = new Set([
    'MAGITING',
    'MAHARLIKA',
    'BULACAN',
    'GREATER_MANILA',
    'BAYANI',
    'MASINAG',
    'MARANGAL',
    'BICOL',
    'CEBU_SOUTH',
    'CEBU_NORTH',
    'CEBU_VISAYAS',
    'ILOILO',
    'CEBU_CENTRAL',
    'BOHOL',
    'NEGROS',
    'LEYTE',
    'DAVAO',
    'MINDANAO',
    'MISAMIS_OCCIDENTAL',
    'ILIGAN_MISAMIS_ORIENTAL',
    'ZAMBOANGA',
    'SOCCSKSARGEN',
    'BUKIDNON_CDO',
  ]);
  for (const [district, ids] of byDistrict.entries()) {
    if (!allowed.has(district)) throw new Error(`Unexpected district ${district}`);
    const idList = ids.map((id) => `'${id.replace(/'/g, '')}'`).join(',');
    await prisma.$executeRawUnsafe(
      `UPDATE "studentRecord" SET "district" = '${district}'::"District" WHERE "deletedAt" IS NULL AND "schoolYear" = '${SCHOOL_YEAR}' AND "id" IN (${idList})`,
    );
  }
  const saved = await prisma.$queryRawUnsafe(
    `SELECT "district"::text AS district, COUNT(*)::int AS count FROM "studentRecord" WHERE "deletedAt" IS NULL AND "schoolYear" = '${SCHOOL_YEAR}' GROUP BY "district" ORDER BY count DESC`,
  );
  console.log('\nSaved:');
  for (const row of saved) {
    console.log(`  ${row.district || '(blank)'}: ${row.count}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
