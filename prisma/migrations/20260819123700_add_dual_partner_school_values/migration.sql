-- Add DUAL partner school values. Must commit before they can be used.
ALTER TYPE "PartnerSchool" ADD VALUE IF NOT EXISTS 'HOMELIFE_KAIROS';
ALTER TYPE "PartnerSchool" ADD VALUE IF NOT EXISTS 'HOMELIFE_MANDAUE';
