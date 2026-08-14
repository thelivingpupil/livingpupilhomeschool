import phil from 'phil-reg-prov-mun-brgy';
import { PHILIPPINE_ISLAND_GROUP } from '@/utils/constants';

const MINDANAO_REG = new Set(['09', '10', '11', '12', '15', '16']);
const VISAYAS_REG = new Set(['06', '07', '08']);
const LUZON_REG = new Set(['01', '02', '03', '04', '05', '13', '14', '17']);

const EXTRA_ALIASES = [
  ['ozamiz', PHILIPPINE_ISLAND_GROUP.MINDANAO],
  ['ozamiz city', PHILIPPINE_ISLAND_GROUP.MINDANAO],
  ['davao de oro', PHILIPPINE_ISLAND_GROUP.MINDANAO],
  ['gensan', PHILIPPINE_ISLAND_GROUP.MINDANAO],
  ['igacos', PHILIPPINE_ISLAND_GROUP.MINDANAO],
  ['mindanao', PHILIPPINE_ISLAND_GROUP.MINDANAO],
  ['caraga', PHILIPPINE_ISLAND_GROUP.MINDANAO],
  ['barmm', PHILIPPINE_ISLAND_GROUP.MINDANAO],
  ['bangsamoro', PHILIPPINE_ISLAND_GROUP.MINDANAO],
  ['soccsksargen', PHILIPPINE_ISLAND_GROUP.MINDANAO],
  ['northern mindanao', PHILIPPINE_ISLAND_GROUP.MINDANAO],
  ['zamboanga peninsula', PHILIPPINE_ISLAND_GROUP.MINDANAO],
  ['visayas', PHILIPPINE_ISLAND_GROUP.VISAYAS],
  ['luzon', PHILIPPINE_ISLAND_GROUP.LUZON],
  ['ncr', PHILIPPINE_ISLAND_GROUP.LUZON],
  ['metro manila', PHILIPPINE_ISLAND_GROUP.LUZON],
  ['mimaropa', PHILIPPINE_ISLAND_GROUP.LUZON],
  ['calabarzon', PHILIPPINE_ISLAND_GROUP.LUZON],
  ['lapulapu', PHILIPPINE_ISLAND_GROUP.VISAYAS],
  ['paranaque', PHILIPPINE_ISLAND_GROUP.LUZON],
];

const normalizePlace = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const groupFromRegCode = (regCode) => {
  if (MINDANAO_REG.has(regCode)) return PHILIPPINE_ISLAND_GROUP.MINDANAO;
  if (VISAYAS_REG.has(regCode)) return PHILIPPINE_ISLAND_GROUP.VISAYAS;
  if (LUZON_REG.has(regCode)) return PHILIPPINE_ISLAND_GROUP.LUZON;
  return null;
};

const aliasesForOfficialName = (officialName) => {
  const stripped = normalizePlace(officialName);
  const isCity = /\bcity\b/i.test(officialName);
  const base = stripped.replace(/^city of\s+/, '').replace(/\s+city$/, '').trim();
  const aliases = new Set();

  if (stripped.length >= 4) aliases.add(stripped);
  if (base.length >= 4) aliases.add(base);

  if (isCity && base.length >= 4) {
    aliases.add(`${base} city`);
    aliases.add(`city of ${base}`);
  }

  return [...aliases];
};

const buildUniqueAliasList = () => {
  const aliasGroups = new Map();

  const addAlias = (alias, group) => {
    if (!alias || alias.length < 4 || !group) return;
    if (!aliasGroups.has(alias)) aliasGroups.set(alias, new Set());
    aliasGroups.get(alias).add(group);
  };

  const addPlace = (officialName, regCode) => {
    const group = groupFromRegCode(regCode);
    aliasesForOfficialName(officialName).forEach((alias) => addAlias(alias, group));
  };

  (phil.provinces || []).forEach((province) =>
    addPlace(province.name, province.reg_code)
  );
  (phil.city_mun || []).forEach((city) => {
    const province = (phil.provinces || []).find(
      (item) => item.prov_code === city.prov_code
    );
    addPlace(city.name, province?.reg_code || city.reg_code);
  });

  EXTRA_ALIASES.forEach(([alias, group]) => addAlias(alias, group));

  return [...aliasGroups.entries()]
    .filter(([, groups]) => groups.size === 1)
    .map(([alias, groups]) => ({ alias, group: [...groups][0] }))
    .sort((a, b) => b.alias.length - a.alias.length);
};

const UNIQUE_ALIASES = buildUniqueAliasList();

const islandGroupFromMindanaoZip = (address) => {
  const matches = String(address).match(/\b(\d{4})\b/g);
  if (!matches?.length) return null;
  const zip = parseInt(matches[matches.length - 1], 10);
  if (zip >= 7000 && zip <= 9811) return PHILIPPINE_ISLAND_GROUP.MINDANAO;
  return null;
};

const matchUniqueAlias = (address) => {
  const normalized = ` ${normalizePlace(address)} `;
  if (!normalized.trim()) return null;

  for (const { alias, group } of UNIQUE_ALIASES) {
    if (normalized.includes(` ${alias} `)) return group;
  }

  return null;
};

/**
 * Classify a free-text PH address into Luzon / Visayas / Mindanao.
 * Uses PSA province/city names from phil-reg-prov-mun-brgy (same source as enrollment).
 * Prefers the rightmost comma-separated token (usually city / province / zip)
 * so barangay names do not steal the match.
 * Ambiguous names that exist in more than one island group are ignored.
 * Returns null when the address is empty or cannot be classified.
 */
export const getIslandGroupFromAddress = (address) => {
  if (!address || !String(address).trim()) return null;

  const parts = String(address)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  for (let i = parts.length - 1; i >= 0; i -= 1) {
    const group = matchUniqueAlias(parts[i]);
    if (group) return group;
  }

  return matchUniqueAlias(address) || islandGroupFromMindanaoZip(address);
};
