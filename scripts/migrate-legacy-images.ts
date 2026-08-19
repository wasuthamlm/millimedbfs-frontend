// Media rows carried over from the old www.millimedbfs.com site still point at
// that host. next.config.ts's images.remotePatterns only allows *.supabase.co,
// so next/image throws "Invalid src prop ... hostname not configured" wherever
// one of these is rendered — a hard render error, not just a broken image icon.
// This re-hosts each one in Supabase Storage (same bucket/convention as
// migrate-base44-images.ts) and repoints Media.url; every consumer (Product,
// Post, Banner, Popup, PageSection) reads the image through that relation, so
// fixing Media.url fixes all of them at once.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { createClient } from "@supabase/supabase-js";

const MEDIA_BUCKET = "media";
const LEGACY_HOST = "millimedbfs.com";

async function migrate(label: string, connectionString: string, supabaseUrl: string, serviceKey: string) {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const rows = await prisma.media.findMany({ where: { url: { contains: LEGACY_HOST } } });
  let updated = 0;
  for (const row of rows) {
    const filename = row.url.split("/").pop() || row.id;
    const path = `legacy-import/${filename}`;

    const res = await fetch(row.url);
    if (!res.ok) {
      console.warn(`  ! [${label}] fetch failed (${res.status}): ${row.url}`);
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "image/jpeg";

    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, buffer, { contentType, upsert: true });
    if (error) {
      console.warn(`  ! [${label}] upload failed for ${path}: ${error.message}`);
      continue;
    }
    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);

    await prisma.media.update({ where: { id: row.id }, data: { url: data.publicUrl, mimeType: contentType } });
    updated++;
  }
  console.log(`[${label}] re-hosted and repointed ${updated}/${rows.length} legacy media row(s)`);
  await prisma.$disconnect();
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!process.env.LOCAL_DATABASE_URL) throw new Error("LOCAL_DATABASE_URL is not set");
  if (!process.env.SUPABASE_URL) throw new Error("SUPABASE_URL is not set");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

  await migrate("local", process.env.LOCAL_DATABASE_URL, process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  await migrate("primary/Supabase", process.env.DATABASE_URL, process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
