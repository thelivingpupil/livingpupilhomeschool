/**
 * Shared full-name helpers (legacy StudentRecord + V2; parent student list).
 */

export function buildFullNameFromParts(firstName, middleName, lastName) {
  const parts = [firstName, middleName, lastName]
    .filter((p) => p != null && String(p).trim() !== '')
    .map((p) => String(p).trim());
  return parts.length ? parts.join(' ') : '';
}

export function normalizeFullNameString(fullName) {
  return String(fullName || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Canonical key for duplicate checks (first + middle + last). */
export function normalizeFullNameFromParts(firstName, middleName, lastName) {
  return normalizeFullNameString(
    buildFullNameFromParts(firstName, middleName, lastName)
  );
}
