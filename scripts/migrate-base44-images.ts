// The CSV import (scripts/import-pages.ts) carried over base44.app image URLs as-is.
// Those aren't in next.config.ts's images.remotePatterns (only *.supabase.co is allowed),
// so Next's Image Optimization API refuses to serve them — broken images on the public site,
// most visibly after a fresh deploy. This downloads each one and re-hosts it in Supabase
// Storage (the bucket this project already uses for all other uploads), then repoints the
// PageSection.config.imageUrl on both the primary and local DB.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { uploadToStorage } from "../lib/supabase-storage";

async function migrate(label: string, connectionString: string, uploadUrls: Map<string, string>) {
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const sections = await prisma.pageSection.findMany();
  let updated = 0;
  for (const section of sections) {
    const config = section.config as Record<string, unknown> | null;
    const imageUrl = config?.imageUrl;
    if (typeof imageUrl !== "string" || !imageUrl.includes("base44.app")) continue;

    const newUrl = uploadUrls.get(imageUrl);
    if (!newUrl) continue;

    await prisma.pageSection.update({
      where: { id: section.id },
      data: { config: { ...config, imageUrl: newUrl } },
    });
    updated++;
  }
  console.log(`${label}: updated ${updated} section(s)`);
  await prisma.$disconnect();
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!process.env.LOCAL_DATABASE_URL) throw new Error("LOCAL_DATABASE_URL is not set");

  const primaryAdapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const primaryPrisma = new PrismaClient({ adapter: primaryAdapter });

  const sections = await primaryPrisma.pageSection.findMany();
  const base44Urls = new Set<string>();
  for (const section of sections) {
    const config = section.config as Record<string, unknown> | null;
    const imageUrl = config?.imageUrl;
    if (typeof imageUrl === "string" && imageUrl.includes("base44.app")) base44Urls.add(imageUrl);
  }
  await primaryPrisma.$disconnect();

  console.log(`Found ${base44Urls.size} distinct base44.app image(s) to migrate`);

  const uploadUrls = new Map<string, string>();
  for (const url of base44Urls) {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  FAILED to download ${url}: ${res.status}`);
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/webp";
    const ext = contentType.includes("webp") ? "webp" : contentType.split("/")[1] ?? "bin";
    const filename = url.split("/").pop()?.split("?")[0] ?? `migrated-${Date.now()}.${ext}`;
    const path = `page-sections/${filename}`;
    const newUrl = await uploadToStorage(path, buffer, contentType);
    uploadUrls.set(url, newUrl);
    console.log(`  ${url} -> ${newUrl}`);
  }

  await migrate("primary", process.env.DATABASE_URL!, uploadUrls);
  await migrate("local", process.env.LOCAL_DATABASE_URL!, uploadUrls);
}

main();
