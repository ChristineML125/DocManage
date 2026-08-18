-- Migration: Add Personal/Company mode support
-- Adds userType column to Users table and makes DepartmentID nullable

ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "userType" VARCHAR(20) DEFAULT 'company';
ALTER TABLE "Users" ALTER COLUMN "DepartmentID" DROP NOT NULL;

-- Create a default category for personal users if not exists
INSERT INTO "Category" ("categoriesName", "description") VALUES
    ('Personal', 'Personal documents')
ON CONFLICT DO NOTHING;
