export const REGION_LABELS = {
  LUZON: 'Luzon',
  VISAYAS: 'Visayas',
  MINDANAO: 'Mindanao',
};

// Prisma's District enum has no region relation, so this is the canonical mapping.
export const DISTRICT_REGION = {
  MAGITING: 'LUZON',
  MAHARLIKA: 'LUZON',
  BULACAN: 'LUZON',
  GREATER_MANILA: 'LUZON',
  BAYANI: 'LUZON',
  MASINAG: 'LUZON',
  MARANGAL: 'LUZON',
  BICOL: 'LUZON',
  CEBU_SOUTH: 'VISAYAS',
  CEBU_NORTH: 'VISAYAS',
  CEBU_VISAYAS: 'VISAYAS',
  CEBU_CENTRAL: 'VISAYAS',
  ILOILO: 'VISAYAS',
  BOHOL: 'VISAYAS',
  NEGROS: 'VISAYAS',
  LEYTE: 'VISAYAS',
  DAVAO: 'MINDANAO',
  MINDANAO: 'MINDANAO',
  MISAMIS_OCCIDENTAL: 'MINDANAO',
  ILIGAN_MISAMIS_ORIENTAL: 'MINDANAO',
  ZAMBOANGA: 'MINDANAO',
  SOCCSKSARGEN: 'MINDANAO',
  BUKIDNON_CDO: 'MINDANAO',
};

export const DISTRICT_LABELS = {
  MAGITING: 'Magiting',
  MAHARLIKA: 'Maharlika',
  BULACAN: 'Bulacan',
  GREATER_MANILA: 'Luzon (Greater Manila)',
  BAYANI: 'Bayani',
  MASINAG: 'Masinag',
  MARANGAL: 'Marangal',
  BICOL: 'Bicol',
  CEBU_SOUTH: 'Cebu South',
  CEBU_NORTH: 'Cebu North',
  CEBU_VISAYAS: '(Cebu)/Visayas',
  ILOILO: 'Iloilo',
  CEBU_CENTRAL: 'Cebu Central',
  BOHOL: 'Bohol',
  NEGROS: 'Negros Island',
  LEYTE: 'Leyte',
  DAVAO: 'Davao',
  MINDANAO: 'Mindanao',
  MISAMIS_OCCIDENTAL: 'Misamis Occidental',
  ILIGAN_MISAMIS_ORIENTAL: 'Iligan – Misamis Oriental',
  ZAMBOANGA: 'Zamboanga',
  SOCCSKSARGEN: 'SOCCSKSARGEN',
  BUKIDNON_CDO: 'Bukidnon – CDO',
  CEBU: 'Cebu',
  LUZON: 'Luzon',
  VISAYAS: 'Visayas',
};

const districtsOf = (region) =>
  Object.keys(DISTRICT_REGION).filter((district) => DISTRICT_REGION[district] === region);

// Event-only scopes that cover several districts. MINDANAO is also a district,
// but as an event scope it has always meant the whole island group.
const GROUP_SCOPES = {
  LUZON: { region: 'LUZON', districts: districtsOf('LUZON') },
  VISAYAS: { region: 'VISAYAS', districts: districtsOf('VISAYAS') },
  MINDANAO: { region: 'MINDANAO', districts: districtsOf('MINDANAO') },
  CEBU: {
    region: 'VISAYAS',
    districts: ['CEBU_SOUTH', 'CEBU_NORTH', 'CEBU_CENTRAL', 'CEBU_VISAYAS'],
  },
};

const AREA_DISTRICT = {
  south: 'CEBU_SOUTH',
  central: 'CEBU_CENTRAL',
  north: 'CEBU_NORTH',
  bayani: 'BAYANI',
  magiting: 'MAGITING',
  maharlika: 'MAHARLIKA',
  marangal: 'MARANGAL',
  masinag: 'MASINAG',
  bulacan: 'BULACAN',
  bicol: 'BICOL',
  'greater-manila': 'GREATER_MANILA',
  iloilo: 'ILOILO',
  bohol: 'BOHOL',
  negros: 'NEGROS',
  leyte: 'LEYTE',
  soccsksargen: 'SOCCSKSARGEN',
  'bukidnon-cdo': 'BUKIDNON_CDO',
  'misamis-occidental': 'MISAMIS_OCCIDENTAL',
  zamboanga: 'ZAMBOANGA',
  davao: 'DAVAO',
  'iligan-misamis-oriental': 'ILIGAN_MISAMIS_ORIENTAL',
  mindanao: 'MINDANAO',
};

export const districtRegion = (district) => DISTRICT_REGION[district] || null;

export const regionDistricts = (region) => (REGION_LABELS[region] ? districtsOf(region) : []);

export const scopeDistricts = (scope) => {
  if (GROUP_SCOPES[scope]) return GROUP_SCOPES[scope].districts;
  return DISTRICT_REGION[scope] ? [scope] : [];
};

export const scopeRegion = (scope) =>
  GROUP_SCOPES[scope]?.region || DISTRICT_REGION[scope] || null;

export const familyRegions = (districts) => [
  ...new Set((districts || []).map(districtRegion).filter(Boolean)),
];

const normalizeScope = (value) => {
  const key = String(value || '')
    .trim()
    .toUpperCase();
  return scopeRegion(key) ? key : null;
};

/**
 * Returns the event's district scope and region. `restricted` events carry a
 * district or area that could not be resolved and must not be shown to anyone.
 */
export const resolveEventScope = (event) => {
  const rawDistrict = String(event.district || '').trim();
  const rawArea = String(event.area || '').trim().toLowerCase();
  const explicit = normalizeScope(rawDistrict);
  const areaDistrict = AREA_DISTRICT[rawArea] || null;

  let scope = null;
  if (explicit && areaDistrict && scopeDistricts(explicit).includes(areaDistrict)) {
    scope = areaDistrict;
  } else if (explicit) {
    scope = explicit;
  } else if (areaDistrict) {
    scope = areaDistrict;
  } else if (!rawDistrict && !rawArea) {
    const text = `${event.title || ''} ${(event.joiners || []).join(' ')} ${event.venue || ''}`.toLowerCase();
    if (/\bcebu\b/.test(text)) scope = 'CEBU';
    else if (/\bluzon\b/.test(text)) scope = 'LUZON';
    else if (/\bmindanao\b/.test(text)) scope = 'MINDANAO';
  }

  const region = scope ? scopeRegion(scope) : null;
  return {
    districtKey: scope,
    regionKey: region,
    restricted: Boolean((rawDistrict || rawArea) && !region),
  };
};

export const canViewEvent = ({ regionKey, restricted }, regions) => {
  if (restricted) return false;
  if (!regionKey) return true;
  return regions.includes(regionKey);
};
