// Primary (Supabase) is the source of truth for Page/PageSection — the admin UI writes
// there directly, and local's copy only ever got the initial CSV import (titles/SEO only,
// no sections). This mirrors every page's sections from primary into local, matched by
// page slug (ids differ between the two DBs by design, so slug is the only stable key).
// Per-page: local sections are replaced with primary's current sections — this only
// overwrites content local already lacked or has stale for that page, and does not
// touch any other table.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!process.env.LOCAL_DATABASE_URL) throw new Error("LOCAL_DATABASE_URL is not set");

  const primaryAdapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const primary = new PrismaClient({ adapter: primaryAdapter });
  const localAdapter = new PrismaPg({ connectionString: process.env.LOCAL_DATABASE_URL });
  const local = new PrismaClient({ adapter: localAdapter });

  const primaryPages = await primary.page.findMany({ include: { sections: { orderBy: { order: "asc" } } } });

  let pagesUpserted = 0;
  let sectionsWritten = 0;
  let skippedNoLocalPage = 0;

  for (const page of primaryPages) {
    const localPage = await local.page.upsert({
      where: { slug: page.slug },
      update: {
        titleTh: page.titleTh,
        titleEn: page.titleEn,
        status: page.status,
        seoTitle: page.seoTitle,
        seoDesc: page.seoDesc,
        archived: page.archived,
      },
      create: {
        slug: page.slug,
        titleTh: page.titleTh,
        titleEn: page.titleEn,
        status: page.status,
        seoTitle: page.seoTitle,
        seoDesc: page.seoDesc,
        archived: page.archived,
      },
    });
    pagesUpserted++;

    if (!localPage) {
      skippedNoLocalPage++;
      continue;
    }

    await local.pageSection.deleteMany({ where: { pageId: localPage.id } });
    if (page.sections.length > 0) {
      await local.pageSection.createMany({
        data: page.sections.map((s) => ({
          pageId: localPage.id,
          order: s.order,
          type: s.type,
          titleTh: s.titleTh,
          titleEn: s.titleEn,
          visibleDesktop: s.visibleDesktop,
          visibleTablet: s.visibleTablet,
          visibleMobile: s.visibleMobile,
          columns: s.columns,
          itemsToShow: s.itemsToShow,
          config: s.config as never,
        })),
      });
      sectionsWritten += page.sections.length;
    }
  }

  console.log(`Pages upserted: ${pagesUpserted}`);
  console.log(`Sections written: ${sectionsWritten}`);
  if (skippedNoLocalPage > 0) console.log(`Skipped (no local page): ${skippedNoLocalPage}`);

  await primary.$disconnect();
  await local.$disconnect();
}

main();
