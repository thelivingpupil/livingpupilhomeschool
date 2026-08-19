-- Map comma-separated text values back to the PartnerSchool enum
UPDATE "studentRecord"
SET "partnerSchool" = 'HOMELIFE_KAIROS'
WHERE "partnerSchool" IN ('HOMELIFE,KAIROS', 'HOMELIFE_KAIROS');

UPDATE "studentRecord"
SET "partnerSchool" = 'HOMELIFE_MANDAUE'
WHERE "partnerSchool" IN ('HOMELIFE,MANDAUE', 'HOMELIFE_MANDAUE');

UPDATE "studentRecord"
SET "partnerSchool" = 'HOMELIFE_KAIROS'
WHERE "accreditation" = 'DUAL'
  AND "partnerSchool" = 'KAIROS';

UPDATE "studentRecord"
SET "partnerSchool" = 'HOMELIFE_MANDAUE'
WHERE "accreditation" = 'DUAL'
  AND "partnerSchool" = 'MANDAUE';

ALTER TABLE "studentRecord"
ALTER COLUMN "partnerSchool" TYPE "PartnerSchool"
USING "partnerSchool"::"PartnerSchool";
