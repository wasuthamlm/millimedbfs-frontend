import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  const rows = await prisma.navLink.findMany({
    where: { placement: "HEADER" },
    include: { children: true },
    orderBy: { order: "asc" },
  });
  for (const r of rows) {
    if (!r.parentId) {
      console.log(`${r.labelTh} -> ${r.href} (children: ${r.children.map(c=>c.labelTh+":"+c.href).join(", ")})`);
    }
  }
  await prisma.$disconnect();
}
main();
