-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'PRESIDENT', 'STAFF');

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "role" "AdminRole" NOT NULL DEFAULT 'STAFF';

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN "isPresident" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: grandfather in every AdminUser row that exists as of this
-- migration as ADMIN, so nobody loses access when the role column is
-- introduced. New rows created after this point default to STAFF unless
-- explicitly granted ADMIN via scripts/invite-admin.ts.
UPDATE "AdminUser" SET "role" = 'ADMIN';
