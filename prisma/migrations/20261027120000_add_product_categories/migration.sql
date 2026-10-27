-- Shop products keep their own category list, matching the CMS shop item categories.
ALTER TABLE "product" ADD COLUMN "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
