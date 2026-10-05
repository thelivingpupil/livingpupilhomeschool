-- Replace the island-level district with the district groups.
-- Existing LUZON / CEBU / MINDANAO values are cleared and reassigned from the student address.
CREATE TYPE "District_new" AS ENUM (
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
  'BUKIDNON_CDO'
);

ALTER TABLE "studentRecord" ALTER COLUMN "district" TYPE "District_new" USING NULL::"District_new";

DROP TYPE "District";

ALTER TYPE "District_new" RENAME TO "District";
