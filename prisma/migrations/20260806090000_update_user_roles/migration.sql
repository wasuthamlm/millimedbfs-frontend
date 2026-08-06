-- Replace Role enum: drop unused EDITOR, add APPROVER and CONTRIBUTOR.
-- No existing rows use EDITOR (verified before writing this migration), so
-- the USING cast below cannot fail on real data.
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'APPROVER', 'CONTRIBUTOR', 'CUSTOMER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "disabled" BOOLEAN NOT NULL DEFAULT false;
