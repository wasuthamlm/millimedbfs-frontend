// "อาคารโรงงาน" is a parent-only nav item (its children are the real building pages);
// its own href had no matching page, so clicking it showed "coming soon". Clearing the
// href makes NavDropdown.tsx render it as a non-navigating hover trigger instead.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

async function fix(label: string, connectionString: string) {
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });
  const result = await prisma.navLink.updateMany({
    where: { labelTh: "อาคารโรงงาน", parentId: null },
    data: { href: "" },
  });
  console.log(`${label}: updated ${result.count} nav link(s)`);
  await prisma.$disconnect();
}

async function main() {
  await fix("primary", process.env.DATABASE_URL!);
  await fix("local", process.env.LOCAL_DATABASE_URL!);
}

main();
