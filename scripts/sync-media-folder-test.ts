// One-off test: create a MediaFolder on the primary (Supabase) DB, then
// mirror the identical row into the local backup DB, and verify both sides
// agree. Confirms the manual primary -> local sync path works end-to-end.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const primary = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const local = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.LOCAL_DATABASE_URL }) });

async function main() {
  const name = `ทดสอบ Sync ${new Date().toISOString()}`;

  const created = await primary.mediaFolder.create({ data: { name } });
  console.log("Created on primary (Supabase):", created);

  await local.mediaFolder.create({ data: { id: created.id, name: created.name, createdAt: created.createdAt } });
  console.log("Mirrored to local DB with matching id.");

  const onPrimary = await primary.mediaFolder.findUnique({ where: { id: created.id } });
  const onLocal = await local.mediaFolder.findUnique({ where: { id: created.id } });

  const inSync =
    !!onPrimary && !!onLocal && onPrimary.id === onLocal.id && onPrimary.name === onLocal.name;

  console.log("Primary row:", onPrimary);
  console.log("Local row:  ", onLocal);
  console.log(inSync ? "✅ In sync." : "❌ Mismatch.");

  console.log("\nCleaning up test row from both databases...");
  await primary.mediaFolder.delete({ where: { id: created.id } });
  await local.mediaFolder.delete({ where: { id: created.id } });
  console.log("Cleanup done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await primary.$disconnect();
    await local.$disconnect();
  });
