-- Convert partnerSchool from enum to text so DUAL can store Homelife + Kairos/Mandaue
ALTER TABLE "studentRecord" ALTER COLUMN "partnerSchool" TYPE TEXT USING "partnerSchool"::text;

-- Backfill existing DUAL records that only have Kairos or Mandaue
UPDATE "studentRecord"
SET "partnerSchool" = 'HOMELIFE,' || "partnerSchool"
WHERE "accreditation" = 'DUAL'
  AND "partnerSchool" IN ('KAIROS', 'MANDAUE');
