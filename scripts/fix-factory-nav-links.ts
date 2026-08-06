// The "อาคารโรงงาน" (Factory) dropdown's child links pointed at old hardcoded
// placeholder routes (/factory/building-1, etc.) instead of the real Page
// slugs imported from Page_export.csv. Repoint them so the nav actually
// reaches the live, editable pages. Applied to both Supabase (primary) and
// the local backup DB.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const HREF_FIXES: Record<string, string> = {
  "/factory/building-1": "/bfs",
  "/factory/central-lab": "/center_lab_building",
  "/factory/building-2": "/hormone",
  "/factory/osd": "/OSD_building",
  "/factory/weerachai": "/Weerachai_Building",
  "/factory/warehouse": "/automated_warehouse",
  "/factory/office": "/manufacturing/office",
};

async function fixIn(label: string, connectionString: string | undefined) {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  let updated = 0;

  for (const [oldHref, newHref] of Object.entries(HREF_FIXES)) {
    const result = await prisma.navLink.updateMany({ where: { href: oldHref }, data: { href: newHref } });
    updated += result.count;
  }

  console.log(`[${label}] updated ${updated} nav link(s)`);
  await prisma.$disconnect();
}

async function main() {
  await fixIn("primary/Supabase", process.env.DATABASE_URL);
  await fixIn("local", process.env.LOCAL_DATABASE_URL);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
