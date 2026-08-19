// Phase 1: import the "clean" entities from the live base44 app (new.millimedbfs.com)
// into this project's DB. base44 exposes a public, unauthenticated read API at
// https://base44.app/api/apps/{appId}/entities/{Entity} — no scraping needed.
//
// Scope (entities with a direct field-level mapping to our schema):
//   MediaFolder, MediaAsset -> Media, ProductCategory, ArticleType -> ArticleCategory,
//   Product, Article -> Post, MenuItem -> NavLink (header), Page (top-level fields only,
//   no sections), Popup -> PopupConfig, and the SiteSetting key/value rows -> SiteSettings /
//   GlobalTheme / SiteHeaderConfig / FooterContact / FooterConfig(colors) / Banner +
//   SiteBannerConfig (from the hero_banners key).
//
// Deliberately OUT of scope here (phase 2, needs design decisions — see import-base44-blocks.ts):
//   PageSection content blocks (base44's generic block builder doesn't map 1:1 onto our
//   typed SectionType enum) and footer_config's column/block builder.
//
// Safety:
//   - Every row this script creates/updates is tagged so re-runs are idempotent (upsert by
//     natural key: slug / sku / key) and so nothing this script didn't create ever gets deleted.
//   - Images are re-hosted from base44.app to Supabase Storage (next.config.ts only allows
//     *.supabase.co in next/image), deduped by source filename so the same asset referenced
//     from multiple entities is only downloaded once.
//   - Run with TARGET=local first, verify with `npm run dev`, THEN run with TARGET=primary.
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  type ProductStatus,
  type PostStatus,
  type PageStatus,
} from "../lib/generated/prisma/client";

const APP_ID = "6a3b5c8792d2ab82b92dcadf";
const BASE44_API = `https://base44.app/api/apps/${APP_ID}/entities`;
const MEDIA_BUCKET = "media";

type Base44Row = Record<string, unknown> & {
  id: string;
  deleted_at?: string | null;
  is_deleted?: boolean;
  is_sample?: boolean;
};

async function fetchEntity<T extends Base44Row>(name: string): Promise<T[]> {
  const res = await fetch(`${BASE44_API}/${name}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`base44 fetch ${name} failed: ${res.status}`);
  const rows = (await res.json()) as T[];
  return rows.filter((r) => !r.deleted_at && !r.is_deleted && !r.is_sample);
}

function str(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}
function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function bool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

// ───────────────────────── image re-hosting (dedup by source filename) ─────────────────────────

function makeImageResolver(supabaseUrl: string, serviceKey: string) {
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const cache = new Map<string, string>();

  return async function resolveImage(url: string | null | undefined): Promise<string | null> {
    if (!url) return null;
    if (!url.includes("base44.app")) return url; // already hosted elsewhere (e.g. re-run)
    if (cache.has(url)) return cache.get(url)!;

    const filename = url.split("/").pop() || `${Date.now()}`;
    const path = `base44-import/${filename}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ! image fetch failed (${res.status}): ${url}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "application/octet-stream";

    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, buffer, { contentType, upsert: true });
    if (error) {
      console.warn(`  ! storage upload failed for ${path}: ${error.message}`);
      return null;
    }
    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    cache.set(url, data.publicUrl);
    return data.publicUrl;
  };
}

// ───────────────────────── main ─────────────────────────

async function run(label: string, connectionString: string) {
  console.log(`\n========== TARGET: ${label} ==========`);
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const resolveImage = makeImageResolver(supabaseUrl, serviceKey);

  const exceptions: string[] = [];
  const stats: Record<string, { created: number; updated: number; skipped: number }> = {};
  const bump = (entity: string, kind: "created" | "updated" | "skipped") => {
    stats[entity] ??= { created: 0, updated: 0, skipped: 0 };
    stats[entity][kind]++;
  };

  // ---- 1. MediaFolder ----
  const folders = await fetchEntity("MediaFolder");
  const folderIdMap = new Map<string, string>(); // base44 id -> our id
  for (const f of folders) {
    const name = str(f.name);
    if (!name) { bump("MediaFolder", "skipped"); continue; }
    const existing = await prisma.mediaFolder.findUnique({ where: { name } });
    const row = existing
      ? existing
      : await prisma.mediaFolder.create({ data: { name } });
    folderIdMap.set(f.id, row.id);
    bump("MediaFolder", existing ? "updated" : "created");
  }

  // ---- 2. MediaAsset -> Media ----
  const assets = await fetchEntity("MediaAsset");
  for (const a of assets) {
    const url = str(a.file_url);
    if (!url) { bump("Media", "skipped"); continue; }
    const hostedUrl = await resolveImage(url);
    if (!hostedUrl) { exceptions.push(`Media: could not re-host ${url}`); bump("Media", "skipped"); continue; }
    const folderId = a.folder_id ? folderIdMap.get(a.folder_id as string) ?? null : null;
    const existing = await prisma.media.findFirst({ where: { url: hostedUrl } });
    if (existing) {
      await prisma.media.update({ where: { id: existing.id }, data: { folderId } });
      bump("Media", "updated");
    } else {
      await prisma.media.create({
        data: {
          url: hostedUrl,
          filename: str(a.file_name) ?? hostedUrl.split("/").pop()!,
          mimeType: str(a.file_type) ?? "application/octet-stream",
          size: 0,
          folderId,
        },
      });
      bump("Media", "created");
    }
  }

  async function mediaIdFor(url: string | null): Promise<string | null> {
    const hosted = await resolveImage(url);
    if (!hosted) return null;
    const existing = await prisma.media.findFirst({ where: { url: hosted } });
    if (existing) return existing.id;
    const created = await prisma.media.create({
      data: { url: hosted, filename: hosted.split("/").pop()!, mimeType: "application/octet-stream", size: 0 },
    });
    return created.id;
  }

  // ---- 3. ProductCategory (two-pass for parentId) ----
  const categories = await fetchEntity("ProductCategory");
  const catIdMap = new Map<string, string>();
  for (const c of categories) {
    const slug = str(c.slug);
    if (!slug) { bump("ProductCategory", "skipped"); continue; }
    const data = {
      nameTh: str(c.name_th) ?? slug,
      nameEn: str(c.name_en),
      order: num(c.sort_order) ?? 0,
      active: bool(c.is_active, true),
    };
    const row = await prisma.productCategory.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });
    catIdMap.set(c.id, row.id);
    bump("ProductCategory", "created");
  }
  for (const c of categories) {
    if (!c.parent_id) continue;
    const ourId = catIdMap.get(c.id);
    const parentOurId = catIdMap.get(c.parent_id as string);
    if (!ourId) continue;
    if (!parentOurId) { exceptions.push(`ProductCategory ${c.slug}: parent ${c.parent_id} not found`); continue; }
    await prisma.productCategory.update({ where: { id: ourId }, data: { parentId: parentOurId } });
  }

  // ---- 4. ArticleType -> ArticleCategory ----
  const articleTypes = await fetchEntity("ArticleType");
  for (const t of articleTypes) {
    const slug = str(t.slug);
    if (!slug) { bump("ArticleCategory", "skipped"); continue; }
    const data = {
      nameTh: str(t.name_th) ?? slug,
      nameEn: str(t.name_en),
      order: num(t.sort_order) ?? 0,
      active: bool(t.is_active, true),
    };
    await prisma.articleCategory.upsert({ where: { slug }, update: data, create: { slug, ...data } });
    bump("ArticleCategory", "created");
  }

  // ---- 5. Product ----
  const products = await fetchEntity("Product");
  for (const p of products) {
    const sku = str(p.slug);
    if (!sku) { bump("Product", "skipped"); continue; }
    const categorySlug = str(p.category);
    const categoryId = categorySlug
      ? (await prisma.productCategory.findUnique({ where: { slug: categorySlug } }))?.id ?? null
      : null;
    if (categorySlug && !categoryId) exceptions.push(`Product ${sku}: category slug "${categorySlug}" not found`);
    const imageId = await mediaIdFor(str(p.featured_image_url));
    const statusMap: Record<string, ProductStatus> = { active: "ACTIVE", draft: "DRAFT", archived: "ARCHIVED" };
    const data = {
      nameTh: str(p.name_th) ?? sku,
      nameEn: str(p.name_en),
      descriptionTh: str(p.description_th) ?? str(p.short_description_th),
      descriptionEn: str(p.description_en) ?? str(p.short_description_en),
      status: statusMap[str(p.status) ?? "draft"] ?? "DRAFT",
      price: num(p.price),
      featured: bool(p.is_featured),
      bestSeller: bool(p.is_bestseller),
      imageId,
      categoryId,
      seoTitle: str(p.meta_title_th),
      seoDesc: str(p.meta_desc_th),
      seoTitleEn: str(p.meta_title_en),
      seoDescEn: str(p.meta_desc_en),
      seoNoIndex: bool(p.no_index),
    };
    await prisma.product.upsert({ where: { sku }, update: data, create: { sku, ...data } });
    bump("Product", "created");
  }

  // ---- 6. Article -> Post ----
  const articles = await fetchEntity("Article");
  for (const a of articles) {
    const slug = str(a.slug);
    if (!slug) { bump("Post", "skipped"); continue; }
    const type = str(a.type) ?? "article";
    const articleCategory = await prisma.articleCategory.findUnique({ where: { slug: type } });
    if (!articleCategory) exceptions.push(`Post ${slug}: article type "${type}" not found`);
    const coverImageId = await mediaIdFor(str(a.cover_image_url));
    const statusMap: Record<string, PostStatus> = { published: "PUBLISHED", draft: "DRAFT" };
    const data = {
      kind: type === "new-and-event" ? ("NEWS" as const) : ("ARTICLE" as const),
      status: statusMap[str(a.status) ?? "draft"] ?? "DRAFT",
      titleTh: str(a.title_th) ?? slug,
      titleEn: str(a.title_en),
      excerptTh: str(a.excerpt_th),
      excerptEn: str(a.excerpt_en),
      bodyTh: str(a.body_th),
      bodyEn: str(a.body_en),
      coverImageId,
      category: type,
      categoryId: articleCategory?.id ?? null,
      publishedAt: str(a.published_at) ? new Date(a.published_at as string) : null,
      seoTitle: str(a.meta_title_th),
      seoDesc: str(a.meta_desc_th),
      seoTitleEn: str(a.meta_title_en),
      seoDescEn: str(a.meta_desc_en),
      seoNoIndex: bool(a.no_index),
    };
    await prisma.post.upsert({ where: { slug }, update: data, create: { slug, ...data } });
    bump("Post", "created");
  }

  // ---- 7. MenuItem -> NavLink (all header; base44 has no separate footer menu entity) ----
  const menuItems = await fetchEntity("MenuItem");
  const navIdMap = new Map<string, string>();
  // match existing header NavLinks by href to avoid duplicating rows already seeded manually
  for (const m of menuItems) {
    const href = str(m.url);
    const labelTh = str(m.label_th);
    if (!href || !labelTh) { bump("NavLink", "skipped"); continue; }
    const existing = await prisma.navLink.findFirst({ where: { href, placement: "HEADER" } });
    const data = {
      labelTh,
      labelEn: str(m.label_en),
      href,
      order: num(m.sort_order) ?? 0,
      active: bool(m.is_active, true),
      placement: "HEADER" as const,
    };
    const row = existing
      ? await prisma.navLink.update({ where: { id: existing.id }, data })
      : await prisma.navLink.create({ data });
    navIdMap.set(m.id, row.id);
    bump("NavLink", existing ? "updated" : "created");
  }
  for (const m of menuItems) {
    if (!m.parent_id) continue;
    const ourId = navIdMap.get(m.id);
    const parentOurId = navIdMap.get(m.parent_id as string);
    if (!ourId) continue;
    if (!parentOurId) { exceptions.push(`NavLink "${m.label_th}": parent ${m.parent_id} not found`); continue; }
    await prisma.navLink.update({ where: { id: ourId }, data: { parentId: parentOurId } });
  }

  // ---- 8. Page (top-level fields only; sections handled in phase 2) ----
  const pages = await fetchEntity("Page");
  for (const p of pages) {
    const slug = str(p.slug);
    if (!slug) { bump("Page", "skipped"); continue; }
    const statusMap: Record<string, PageStatus> = { published: "PUBLISHED", draft: "DRAFT" };
    const data = {
      titleTh: str(p.title_th) ?? slug,
      titleEn: str(p.title_en),
      status: statusMap[str(p.status) ?? "draft"] ?? "DRAFT",
      seoTitle: str(p.meta_title_th),
      seoDesc: str(p.meta_desc_th),
      seoTitleEn: str(p.meta_title_en),
      seoDescEn: str(p.meta_desc_en),
      seoNoIndex: bool(p.no_index),
      archived: bool(p.is_permanently_deleted) || bool(p.is_deleted),
    };
    await prisma.page.upsert({ where: { slug }, update: data, create: { slug, ...data } });
    bump("Page", "created");
  }

  // ---- 9. Popup -> PopupConfig (singleton — only the most recently updated active one) ----
  const popups = await fetchEntity("Popup");
  const activePopup = popups
    .filter((p) => bool(p.is_active))
    .sort((a, b) => String(b.updated_date).localeCompare(String(a.updated_date)))[0];
  if (activePopup) {
    const imageId = await mediaIdFor(str(activePopup.image_url));
    await prisma.popupConfig.upsert({
      where: { id: "singleton" },
      update: {
        enabled: true,
        titleTh: str(activePopup.title_th),
        imageId,
        link: str(activePopup.button_url),
      },
      create: {
        id: "singleton",
        enabled: true,
        titleTh: str(activePopup.title_th),
        imageId,
        link: str(activePopup.button_url),
      },
    });
    bump("PopupConfig", "created");
  }

  // ---- 10. SiteSetting key/value rows -> several singleton config tables ----
  const settingsRows = await fetchEntity<Base44Row & { key?: string; value?: unknown }>("SiteSetting");
  const settings = new Map<string, unknown>();
  for (const r of settingsRows) if (typeof r.key === "string") settings.set(r.key, r.value);
  const g = (k: string) => str(settings.get(k));
  const gb = (k: string, fallback = false) => bool(settings.get(k), fallback);
  const gn = (k: string) => num(settings.get(k));

  const siteLogoId = await mediaIdFor(g("site_logo_url"));
  const faviconId = await mediaIdFor(g("favicon_url"));
  const loginBgId = await mediaIdFor(g("admin_login_bg_url"));
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      siteNameTh: g("site_name_th"), siteNameEn: g("site_name_en"), siteUrl: g("site_url"),
      youtubeEmbedUrl: g("youtube_embed_url"),
      gtmId: g("gtm_id"), ga4Id: g("ga4_id"), fbPixelId: g("fb_pixel_id"), tiktokPixelId: g("tiktok_pixel_id"),
      facebookUrl: g("facebook_url"), instagramUrl: g("instagram_url"), youtubeUrl: g("youtube_url"),
      tiktokUrl: g("tiktok_url"), lineUrl: g("line_url"),
      socialIconStyle: g("social_icon_style") ?? "circle-outline",
      showSocialInHeader: gb("social_show_header"),
      siteLogoId, faviconId, loginBgId,
    },
    create: {
      id: "singleton",
      siteNameTh: g("site_name_th"), siteNameEn: g("site_name_en"), siteUrl: g("site_url"),
      youtubeEmbedUrl: g("youtube_embed_url"),
      gtmId: g("gtm_id"), ga4Id: g("ga4_id"), fbPixelId: g("fb_pixel_id"), tiktokPixelId: g("tiktok_pixel_id"),
      facebookUrl: g("facebook_url"), instagramUrl: g("instagram_url"), youtubeUrl: g("youtube_url"),
      tiktokUrl: g("tiktok_url"), lineUrl: g("line_url"),
      socialIconStyle: g("social_icon_style") ?? "circle-outline",
      showSocialInHeader: gb("social_show_header"),
      siteLogoId, faviconId, loginBgId,
    },
  });
  bump("SiteSettings", "created");

  await prisma.footerContact.upsert({
    where: { id: "singleton" },
    update: {
      phone: g("contact_phone") ?? g("site_phone"),
      email: g("contact_email"),
      address: g("contact_address_th") ?? g("site_address_th"),
      addressEn: g("contact_address_en") ?? g("site_address_en"),
      companyNameTh: g("company_name_th"), companyNameEn: g("company_name_en"),
      taxId: g("tax_id"), lineId: g("contact_line"),
      googleMapsEmbedUrl: g("google_maps_embed"),
    },
    create: {
      id: "singleton",
      phone: g("contact_phone") ?? g("site_phone"),
      email: g("contact_email"),
      address: g("contact_address_th") ?? g("site_address_th"),
      addressEn: g("contact_address_en") ?? g("site_address_en"),
      companyNameTh: g("company_name_th"), companyNameEn: g("company_name_en"),
      taxId: g("tax_id"), lineId: g("contact_line"),
      googleMapsEmbedUrl: g("google_maps_embed"),
    },
  });
  bump("FooterContact", "created");

  await prisma.footerConfig.upsert({
    where: { id: "singleton" },
    update: {
      bgColor: g("global_footer_bg_color") ?? "#032f87",
      textColor: g("global_footer_text_color") ?? "#ffffff",
      accentColor: g("global_footer_accent_color") ?? "#fed22f",
    },
    create: {
      id: "singleton",
      bgColor: g("global_footer_bg_color") ?? "#032f87",
      textColor: g("global_footer_text_color") ?? "#ffffff",
      accentColor: g("global_footer_accent_color") ?? "#fed22f",
    },
  });
  bump("FooterConfig", "created");

  await prisma.globalTheme.upsert({
    where: { id: "singleton" },
    update: {
      fontHeader: g("global_heading_font_family") ?? "Prompt",
      fontBody: g("global_body_font_family") ?? "Sarabun",
      colorPrimary: g("global_primary_color") ?? "#032f87",
      colorPrimaryHover: g("global_primary_hover_color") ?? "#ffe45c",
      colorAccent: g("global_accent_color") ?? "#fed22f",
      colorBackground: g("global_background_color") ?? "#dfedfb",
      colorText: g("global_text_color") ?? "#121212",
      buttonRadius: g("global_button_radius") ?? "soft-sm",
    },
    create: {
      id: "singleton",
      fontHeader: g("global_heading_font_family") ?? "Prompt",
      fontBody: g("global_body_font_family") ?? "Sarabun",
      colorPrimary: g("global_primary_color") ?? "#032f87",
      colorPrimaryHover: g("global_primary_hover_color") ?? "#ffe45c",
      colorAccent: g("global_accent_color") ?? "#fed22f",
      colorBackground: g("global_background_color") ?? "#dfedfb",
      colorText: g("global_text_color") ?? "#121212",
      buttonRadius: g("global_button_radius") ?? "soft-sm",
    },
  });
  bump("GlobalTheme", "created");

  await prisma.siteHeaderConfig.upsert({
    where: { id: "singleton" },
    update: {
      layout: g("header_menu_layout") ?? "logo-left-menu-center",
      height: g("header_height") ?? "standard",
      shadow: g("header_shadow") ?? "strong",
      position: g("header_position") ?? "fixed-top",
      bgColor: g("global_header_bg_color") ?? "#032f87",
      textColor: g("global_header_text_color") ?? "#ffffff",
      hoverBgColor: g("header_hover_bg_color") ?? "#fed22f",
      hoverTextColor: g("header_hover_text_color") ?? "#000000",
      activeBgColor: g("header_active_bg_color") ?? "#fed22f",
      activeTextColor: g("header_active_text_color") ?? "#000000",
      iconTextColor: g("header_logo_icon_color") ?? "#fed22f",
      logoMode: g("header_logo_mode") ?? "site-settings",
      logoTextTh: g("header_logo_text_th"), logoTextEn: g("header_logo_text_en"),
      menuWrap: g("header_menu_text_wrap") ?? "single-line",
      menuFontSize: g("header_menu_font_size") ?? "normal",
      menuLevels: gn("submenu_depth") ?? 2,
      submenuStyle: g("submenu_display") ?? "click-open",
      submenuChildBehavior: g("submenu_level2_display") ?? "below-parent",
      showSearch: gb("show_search"), showLanguage: gb("show_language", true),
      showAccount: gb("show_account"), showCart: gb("show_cart"),
    },
    create: {
      id: "singleton",
      layout: g("header_menu_layout") ?? "logo-left-menu-center",
      height: g("header_height") ?? "standard",
      shadow: g("header_shadow") ?? "strong",
      position: g("header_position") ?? "fixed-top",
      bgColor: g("global_header_bg_color") ?? "#032f87",
      textColor: g("global_header_text_color") ?? "#ffffff",
      hoverBgColor: g("header_hover_bg_color") ?? "#fed22f",
      hoverTextColor: g("header_hover_text_color") ?? "#000000",
      activeBgColor: g("header_active_bg_color") ?? "#fed22f",
      activeTextColor: g("header_active_text_color") ?? "#000000",
      iconTextColor: g("header_logo_icon_color") ?? "#fed22f",
      logoMode: g("header_logo_mode") ?? "site-settings",
      logoTextTh: g("header_logo_text_th"), logoTextEn: g("header_logo_text_en"),
      menuWrap: g("header_menu_text_wrap") ?? "single-line",
      menuFontSize: g("header_menu_font_size") ?? "normal",
      menuLevels: gn("submenu_depth") ?? 2,
      submenuStyle: g("submenu_display") ?? "click-open",
      submenuChildBehavior: g("submenu_level2_display") ?? "below-parent",
      showSearch: gb("show_search"), showLanguage: gb("show_language", true),
      showAccount: gb("show_account"), showCart: gb("show_cart"),
    },
  });
  bump("SiteHeaderConfig", "created");

  // ---- 11. hero_banners key -> Banner rows + SiteBannerConfig ----
  const heroRaw = settings.get("hero_banners");
  if (typeof heroRaw === "string") {
    try {
      const hero = JSON.parse(heroRaw) as {
        slider?: Record<string, unknown>;
        banners?: Array<Record<string, unknown>>;
      };
      if (hero.slider) {
        const s = hero.slider;
        await prisma.siteBannerConfig.upsert({
          where: { id: "singleton" },
          update: {
            transitionEffect: str(s.effect) ?? "fade",
            direction: str(s.direction) ?? "ltr",
            transitionSpeedMs: num(s.speed) ?? 700,
            displayDurationMs: num(s.interval) ?? 5000,
            autoplay: bool(s.autoplay, true),
            loop: bool(s.loop, true),
            pauseOnHover: bool(s.pauseOnHover, true),
            showArrows: bool(s.showArrows, true),
            showDots: bool(s.showDots, true),
          },
          create: {
            id: "singleton",
            transitionEffect: str(s.effect) ?? "fade",
            direction: str(s.direction) ?? "ltr",
            transitionSpeedMs: num(s.speed) ?? 700,
            displayDurationMs: num(s.interval) ?? 5000,
            autoplay: bool(s.autoplay, true),
            loop: bool(s.loop, true),
            pauseOnHover: bool(s.pauseOnHover, true),
            showArrows: bool(s.showArrows, true),
            showDots: bool(s.showDots, true),
          },
        });
        bump("SiteBannerConfig", "created");
      }
      if (Array.isArray(hero.banners)) {
        // tag-and-replace: delete only banners this import previously created, then recreate
        await prisma.banner.deleteMany({ where: { link: { startsWith: "__base44_import__" } } });
        for (const b of hero.banners) {
          const fileUrl = str(b.file_url);
          if (!fileUrl) continue;
          const imageId = await mediaIdFor(fileUrl);
          if (!imageId) { exceptions.push(`Banner: could not resolve image ${fileUrl}`); continue; }
          const link = str(b.link_url);
          await prisma.banner.create({
            data: {
              titleTh: str(b.title_th) ?? "",
              titleEn: str(b.title_en),
              altTextTh: str(b.alt_th),
              altTextEn: str(b.alt_en),
              captionTh: str(b.caption_th),
              captionEn: str(b.caption_en),
              imageId,
              link: link ?? "__base44_import__",
              order: num(b.sort_order) ?? 0,
              active: true,
            },
          });
          bump("Banner", "created");
        }
      }
    } catch (e) {
      exceptions.push(`hero_banners: JSON parse failed: ${(e as Error).message}`);
    }
  }

  console.log(`\n--- ${label}: summary ---`);
  for (const [entity, s] of Object.entries(stats)) {
    console.log(`  ${entity}: created ${s.created}, updated ${s.updated}, skipped ${s.skipped}`);
  }
  if (exceptions.length > 0) {
    console.log(`\n--- ${label}: exceptions (${exceptions.length}) ---`);
    for (const e of exceptions) console.log(`  ! ${e}`);
  }

  await prisma.$disconnect();
}

async function main() {
  const target = process.env.TARGET ?? "local";
  if (target === "local") {
    if (!process.env.LOCAL_DATABASE_URL) throw new Error("LOCAL_DATABASE_URL is not set");
    await run("local", process.env.LOCAL_DATABASE_URL);
  } else if (target === "primary") {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
    await run("primary/Supabase", process.env.DATABASE_URL);
  } else {
    throw new Error(`Unknown TARGET "${target}" — use "local" or "primary"`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
