/**
 * Dry run: classify StudentRecord.district from the saved address.
 * Does not write to the database.
 *
 * Usage:
 *   node scripts/mock-student-district.js
 *   node scripts/mock-student-district.js --verify
 *   node scripts/mock-student-district.js --apply
 */

const fs = require('fs');
const path = require('path');
const phil = require('phil-reg-prov-mun-brgy');
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

const LUZON_REG = new Set(['01', '02', '03', '04', '05', '13', '14', '17']);
const MINDANAO_REG = new Set(['09', '10', '11', '12', '15', '16']);

const PRIORITY_SCHOOL_YEAR = '2026-2027';
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

const districtFromRegion = (regCode, provinceName) => {
  if (normalize(provinceName) === 'cebu') return 'CEBU';
  if (LUZON_REG.has(String(regCode))) return 'LUZON';
  if (MINDANAO_REG.has(String(regCode))) return 'MINDANAO';
  return null;
};

const provinceDistrict = new Map();
const outsideProvince = new Set();
for (const province of phil.provinces || []) {
  const key = normalize(province.name);
  if (!key) continue;
  const district = districtFromRegion(province.reg_code, province.name);
  if (district) provinceDistrict.set(key, district);
  else outsideProvince.add(key);
}
provinceDistrict.set('metro manila', 'LUZON');
provinceDistrict.set('ncr', 'LUZON');
provinceDistrict.set('ncr first district', 'LUZON');
provinceDistrict.set('ncr second district', 'LUZON');
provinceDistrict.set('ncr third district', 'LUZON');
provinceDistrict.set('ncr fourth district', 'LUZON');

const cityDistricts = new Map();
for (const city of phil.city_mun || []) {
  const province = (phil.provinces || []).find(
    (item) => item.prov_code === city.prov_code,
  );
  const district = districtFromRegion(
    province?.reg_code || city.reg_code,
    province?.name,
  );
  const key = normalize(city.name);
  if (!key || !district) continue;
  if (!cityDistricts.has(key)) cityDistricts.set(key, new Set());
  cityDistricts.get(key).add(district);
}

const uniqueCityDistrict = new Map();
for (const [key, districts] of cityDistricts) {
  if (districts.size === 1) uniqueCityDistrict.set(key, [...districts][0]);
}

const isZip = (value) => /^\d{4}$/.test(normalize(value));

const classifyAddress = (address) => {
  const parts = String(address || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  for (let i = parts.length - 1; i >= 0; i -= 1) {
    if (isZip(parts[i])) continue;
    const key = normalize(parts[i]);
    if (!key || key === 'undefined' || key === 'null') continue;
    if (outsideProvince.has(key)) {
      return { district: null, via: 'outside', token: parts[i] };
    }
    if (provinceDistrict.has(key)) {
      return {
        district: provinceDistrict.get(key),
        via: 'province',
        token: parts[i],
      };
    }
    if (uniqueCityDistrict.has(key)) {
      return {
        district: uniqueCityDistrict.get(key),
        via: 'city',
        token: parts[i],
      };
    }
  }

  const locationParts = parts.filter(
    (part) => !isZip(part) && normalize(part) && normalize(part) !== 'undefined',
  );
  return {
    district: null,
    via: null,
    token: locationParts[locationParts.length - 1] || '',
  };
};

const bump = (map, key) => {
  const name = key || '(blank)';
  map.set(name, (map.get(name) || 0) + 1);
};

const topEntries = (map, limit = 15) =>
  [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);

const NOTED_UNRECOGNIZED = {
  iloilo: 30,
  bohol: 23,
  leyte: 22,
  'negros oriental': 15,
  'negros occidental': 8,
  'southern leyte': 7,
  capiz: 4,
  biliran: 3,
  siquijor: 3,
  aklan: 2,
  samar: 2,
  test: 1,
  antique: 1,
};

const verifyPlan = (counts, unrecognizedTokens, updates) => {
  const errors = [];
  const assigned = counts.CEBU + counts.LUZON + counts.MINDANAO;
  if (
    counts.total !==
    counts.alreadySet + assigned + counts.abroad + counts.unrecognized
  ) {
    errors.push('Counts do not add up to the active student total.');
  }
  if (counts.byCity !== 0) {
    errors.push('A match used the city instead of the province.');
  }
  if (counts.fromAddress1 !== 0) {
    errors.push('A match used address1 instead of address2.');
  }
  if (counts.blank !== 0) {
    errors.push('A student in this school year has no address.');
  }
  if (updates.length !== assigned) {
    errors.push('The update list does not match the assigned count.');
  }
  const notedTotal = Object.values(NOTED_UNRECOGNIZED).reduce(
    (sum, count) => sum + count,
    0,
  );
  if (counts.unrecognized - counts.blank !== notedTotal) {
    errors.push(
      `Unrecognized addresses are ${counts.unrecognized - counts.blank}, expected ${notedTotal}.`,
    );
  }
  for (const [token, expected] of Object.entries(NOTED_UNRECOGNIZED)) {
    const actual = unrecognizedTokens.get(token) || 0;
    if (actual !== expected) {
      errors.push(`${token} is ${actual}, expected ${expected}.`);
    }
  }
  for (const token of unrecognizedTokens.keys()) {
    if (token === '(blank)') continue;
    if (!Object.prototype.hasOwnProperty.call(NOTED_UNRECOGNIZED, token)) {
      errors.push(`Unexpected unrecognized address ending: ${token}.`);
    }
  }
  for (const update of updates) {
    if (!['CEBU', 'LUZON', 'MINDANAO'].includes(update.district)) {
      errors.push(`Invalid district ${update.district}.`);
    }
    if (update.via !== 'province' || update.source !== 'address2') {
      errors.push(`Update ${update.id} is not a province match on address2.`);
    }
  }
  return errors;
};

async function main() {
  const apply = process.argv.includes('--apply');
  if (apply) {
    console.error(
      'Use scripts/assign-student-district-groups.js --apply for district groups.',
    );
    process.exit(1);
  }
  const verify = apply || process.argv.includes('--verify');
  const students = await prisma.studentRecord.findMany({
    where: { deletedAt: null, schoolYear: PRIORITY_SCHOOL_YEAR },
    select: {
      id: true,
      schoolYear: true,
      studentAddress1: true,
      studentAddress2: true,
      isInternationalAddress: true,
      district: true,
    },
  });

  const counts = {
    total: students.length,
    alreadySet: 0,
    CEBU: 0,
    LUZON: 0,
    MINDANAO: 0,
    abroad: 0,
    unrecognized: 0,
    blank: 0,
    fromAddress2: 0,
    fromAddress1: 0,
    byProvince: 0,
    byCity: 0,
  };
  const byYear = new Map();
  const unrecognizedTokens = new Map();
  const unrecognizedSamples = new Map();
  const samples = { CEBU: [], LUZON: [], MINDANAO: [], unrecognized: [] };
  const citySamples = [];
  const updates = [];

  for (const student of students) {
    if (student.district) {
      counts.alreadySet += 1;
      continue;
    }

    if (student.isInternationalAddress) {
      counts.abroad += 1;
      continue;
    }

    let result = classifyAddress(student.studentAddress2);
    let source = 'address2';
    if (!result.district) {
      const fallback = classifyAddress(student.studentAddress1);
      if (fallback.district) {
        result = fallback;
        source = 'address1';
      }
    }

    if (!result.district) {
      counts.unrecognized += 1;
      const token = normalize(result.token);
      bump(unrecognizedTokens, token);
      const address =
        student.studentAddress2 || student.studentAddress1 || '';
      if (!address.trim()) counts.blank += 1;
      if (address.trim()) {
        if (!unrecognizedSamples.has(token)) unrecognizedSamples.set(token, []);
        const bucket = unrecognizedSamples.get(token);
        if (bucket.length < 3) {
          bucket.push(`${student.schoolYear || 'no year'} | ${address}`);
        }
      }
      continue;
    }

    counts[result.district] += 1;
    updates.push({
      id: student.id,
      district: result.district,
      via: result.via,
      source,
    });
    if (source === 'address2') counts.fromAddress2 += 1;
    else counts.fromAddress1 += 1;
    if (result.via === 'province') counts.byProvince += 1;
    else {
      counts.byCity += 1;
      if (citySamples.length < 40) {
        citySamples.push(
          `${result.district} via ${result.token}: ${student.studentAddress2 || student.studentAddress1}`,
        );
      }
    }

    const year = student.schoolYear || '(no school year)';
    if (!byYear.has(year)) {
      byYear.set(year, { CEBU: 0, LUZON: 0, MINDANAO: 0 });
    }
    byYear.get(year)[result.district] += 1;

    if (samples[result.district].length < 5) {
      samples[result.district].push(
        `${result.via}: ${student.studentAddress2 || student.studentAddress1}`,
      );
    }
  }

  console.log(
    apply
      ? `Applying districts for ${PRIORITY_SCHOOL_YEAR}.\n`
      : `Mock only for ${PRIORITY_SCHOOL_YEAR}. No rows were updated.\n`,
  );
  console.log(`Active ${PRIORITY_SCHOOL_YEAR} students: ${counts.total}`);
  console.log(`Already had a district: ${counts.alreadySet}`);
  console.log(`Would set CEBU: ${counts.CEBU}`);
  console.log(`Would set LUZON: ${counts.LUZON}`);
  console.log(`Would set MINDANAO: ${counts.MINDANAO}`);
  console.log(`Left blank, abroad: ${counts.abroad}`);
  console.log(
    `Left blank, no address: ${counts.blank}`,
  );
  console.log(
    `Left blank, address not recognized: ${counts.unrecognized - counts.blank}`,
  );
  console.log(
    `\nMatched from address2: ${counts.fromAddress2}, from address1: ${counts.fromAddress1}`,
  );
  console.log(
    `Matched on province: ${counts.byProvince}, on city: ${counts.byCity}`,
  );

  console.log('\nBy school year:');
  for (const [year, row] of [...byYear.entries()].sort((a, b) =>
    String(a[0]).localeCompare(String(b[0])),
  )) {
    console.log(
      `  ${year}: Cebu ${row.CEBU}, Luzon ${row.LUZON}, Mindanao ${row.MINDANAO}`,
    );
  }

  console.log('\nSample matches:');
  for (const district of ['CEBU', 'LUZON', 'MINDANAO']) {
    console.log(`  ${district}`);
    for (const sample of samples[district]) console.log(`    ${sample}`);
  }

  console.log('\nUnrecognized address endings:');
  for (const [token, count] of topEntries(unrecognizedTokens)) {
    console.log(`  ${count}\t${token}`);
  }

  console.log('\nCity-only matches:');
  for (const sample of citySamples) console.log(`  ${sample}`);

  if (verify) {
    const errors = verifyPlan(counts, unrecognizedTokens, updates);
    if (errors.length) {
      console.log('\nVerification failed:');
      for (const error of errors) console.log(`  ${error}`);
      process.exitCode = 1;
      return;
    }
    console.log(
      `\nVerified ${updates.length} province matches for ${PRIORITY_SCHOOL_YEAR}. The noted addresses stay blank.`,
    );
  }

  if (apply) {
    const byDistrict = { CEBU: [], LUZON: [], MINDANAO: [] };
    for (const update of updates) byDistrict[update.district].push(update.id);
    await prisma.$transaction(
      Object.entries(byDistrict).map(([district, ids]) =>
        prisma.studentRecord.updateMany({
          where: {
            id: { in: ids },
            deletedAt: null,
            schoolYear: PRIORITY_SCHOOL_YEAR,
            district: null,
          },
          data: { district },
        }),
      ),
    );
    const saved = await prisma.studentRecord.groupBy({
      by: ['district'],
      where: { deletedAt: null, schoolYear: PRIORITY_SCHOOL_YEAR },
      _count: { _all: true },
    });
    const otherYears = await prisma.studentRecord.count({
      where: {
        deletedAt: null,
        schoolYear: { not: PRIORITY_SCHOOL_YEAR },
        district: { not: null },
      },
    });
    console.log('\nSaved 2026-2027 districts:');
    for (const row of saved) {
      console.log(`  ${row.district || '(blank)'}: ${row._count._all}`);
    }
    console.log(`Other school years with a district: ${otherYears}`);
  }

  console.log('\nUnrecognized samples:');
  for (const [token, count] of topEntries(unrecognizedTokens, 20)) {
    const bucket = unrecognizedSamples.get(token) || [];
    if (!bucket.length) continue;
    console.log(`\n  ${token} (${count})`);
    for (const sample of bucket) console.log(`    ${sample}`);
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
