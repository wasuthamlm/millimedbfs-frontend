import { prisma } from "@/lib/prisma";

/**
 * Finds every place a media file is used — both FK relations (cover images,
 * banners, logo, …) and plain URL references inside rich text, page-section
 * config JSON, translations and the site-wide config rows. Ported from the
 * legacy site's src/lib/mediaUsage.js.
 *
 * The media library's "unused" filter and delete warnings rely on this, so a
 * missed source means a file that's live on the site could be offered up for
 * deletion. When adding a model/field that can hold a media URL, add it here.
 */

type TextSource = { label: string; text: string };

async function loadTextSources(): Promise<TextSource[]> {
  const [posts, products, sections, translations, header, footerConfig, footerContact, bannerConfig, widgets, theme, settings] =
    await Promise.all([
      prisma.post.findMany({ select: { titleTh: true, slug: true, bodyTh: true, bodyEn: true, excerptTh: true, excerptEn: true } }),
      prisma.product.findMany({ select: { nameTh: true, sku: true, descriptionTh: true, descriptionEn: true } }),
      prisma.pageSection.findMany({ select: { config: true, page: { select: { slug: true } } } }),
      prisma.translation.findMany({ select: { entityType: true, value: true } }),
      prisma.siteHeaderConfig.findMany(),
      prisma.footerConfig.findMany(),
      prisma.footerContact.findMany(),
      prisma.siteBannerConfig.findMany(),
      prisma.widget.findMany(),
      prisma.globalTheme.findMany(),
      prisma.siteSettings.findMany(),
    ]);

  const sources: TextSource[] = [];
  for (const p of posts) {
    sources.push({
      label: `บทความ: ${p.titleTh || p.slug}`,
      text: [p.bodyTh, p.bodyEn, p.excerptTh, p.excerptEn].filter(Boolean).join("\n"),
    });
  }
  for (const p of products) {
    sources.push({
      label: `สินค้า: ${p.nameTh || p.sku}`,
      text: [p.descriptionTh, p.descriptionEn].filter(Boolean).join("\n"),
    });
  }
  for (const s of sections) {
    if (s.config) sources.push({ label: `หน้า: ${s.page?.slug ?? "-"}`, text: JSON.stringify(s.config) });
  }
  for (const t of translations) {
    sources.push({ label: `คำแปล: ${t.entityType}`, text: t.value });
  }
  const singletons: [string, unknown[]][] = [
    ["ส่วนหัวเว็บ (Header)", header],
    ["ส่วนท้ายเว็บ (Footer)", footerConfig],
    ["ส่วนท้ายเว็บ (Footer)", footerContact],
    ["แบนเนอร์หน้าแรก", bannerConfig],
    ["Widgets", widgets],
    ["ธีมเว็บไซต์", theme],
    ["ตั้งค่าเว็บไซต์", settings],
  ];
  for (const [label, rows] of singletons) {
    if (rows.length) sources.push({ label, text: JSON.stringify(rows) });
  }
  return sources;
}

/** Map of media id → human-readable (Thai) list of places using it. Media with no entry are unused. */
export async function getMediaUsage(): Promise<Map<string, string[]>> {
  const [media, sources] = await Promise.all([
    prisma.media.findMany({
      select: {
        id: true,
        url: true,
        posts: { select: { titleTh: true, slug: true } },
        products: { select: { nameTh: true, sku: true } },
        banners: { select: { id: true } },
        popups: { select: { id: true } },
        siteLogoFor: { select: { id: true } },
        faviconFor: { select: { id: true } },
        loginBgFor: { select: { id: true } },
      },
    }),
    loadTextSources(),
  ]);

  const usage = new Map<string, string[]>();
  for (const m of media) {
    const places: string[] = [];
    for (const p of m.posts) places.push(`บทความ: ${p.titleTh || p.slug}`);
    for (const p of m.products) places.push(`สินค้า: ${p.nameTh || p.sku}`);
    if (m.banners.length) places.push("แบนเนอร์หน้าแรก");
    if (m.popups.length) places.push("Popup");
    if (m.siteLogoFor.length) places.push("โลโก้เว็บไซต์");
    if (m.faviconFor.length) places.push("Favicon");
    if (m.loginBgFor.length) places.push("พื้นหลังหน้าเข้าสู่ระบบ");
    for (const s of sources) {
      if (s.text.includes(m.url) && !places.includes(s.label)) places.push(s.label);
    }
    if (places.length) usage.set(m.id, places);
  }
  return usage;
}
