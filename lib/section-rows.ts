import "server-only";
import { Prisma } from "@/lib/generated/prisma/client";
import { sanitizeHtml } from "@/lib/sanitize";
import { TYPE_FROM_DB, TYPE_TO_DB, parseConfig, type PageSection, type SectionConfig } from "@/lib/sections";

// Per-block config JSON is admin-authored; cap it so a runaway paste can't bloat the row.
const MAX_CONFIG_BYTES = 200_000;

/** Rich-text fields are sanitized on save as well as on render. */
function cleanConfig(config: SectionConfig): SectionConfig {
  const clean: SectionConfig = { ...config };
  if (clean.bodyTh) clean.bodyTh = sanitizeHtml(clean.bodyTh);
  if (clean.bodyEn) clean.bodyEn = sanitizeHtml(clean.bodyEn);
  if (clean.layoutColumns) {
    clean.layoutColumns = clean.layoutColumns.map((c) => ({
      ...c,
      bodyTh: c.bodyTh ? sanitizeHtml(c.bodyTh) : c.bodyTh,
      bodyEn: c.bodyEn ? sanitizeHtml(c.bodyEn) : c.bodyEn,
    }));
  }
  if (clean.anchorId) clean.anchorId = clean.anchorId.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 60);
  return clean;
}

/** Editor blocks → PageSection rows (without pageId / landingPageId), sanitized and size-capped. */
export function buildSectionRows(sections: PageSection[]) {
  if (sections.length > 60) return { error: "บล็อกในหน้าเดียวต้องไม่เกิน 60 บล็อก" } as const;
  const rows = sections.map((section, i) => {
    const config = cleanConfig(section.config ?? {});
    return {
      order: i,
      type: TYPE_TO_DB[section.type],
      titleTh: section.titleTh.slice(0, 300),
      titleEn: section.titleEn?.slice(0, 300) || null,
      customLabel: section.customLabel?.slice(0, 120) || null,
      bodyEn: config.bodyEn ?? null,
      visibleDesktop: section.visibility.desktop,
      visibleTablet: section.visibility.tablet,
      visibleMobile: section.visibility.mobile,
      columns: section.columns ?? null,
      itemsToShow: section.itemsToShow ?? null,
      config: { ...config, sourceLabel: section.sourceLabel } as Prisma.InputJsonValue,
    };
  });
  if (rows.some((r) => JSON.stringify(r.config).length > MAX_CONFIG_BYTES)) {
    return { error: "เนื้อหาในบล็อกใหญ่เกินไป (เกิน 200KB) — ลองแบ่งเป็นหลายบล็อก" };
  }
  return { rows };
}

type SectionRowLike = {
  id: string;
  order: number;
  type: keyof typeof TYPE_FROM_DB;
  titleTh: string;
  titleEn: string | null;
  customLabel: string | null;
  bodyEn: string | null;
  visibleDesktop: boolean;
  visibleTablet: boolean;
  visibleMobile: boolean;
  columns: number | null;
  itemsToShow: number | null;
  config: Prisma.JsonValue;
};

/** PageSection rows → editor blocks (inverse of buildSectionRows). */
export function rowsToEditorSections(rows: SectionRowLike[]): PageSection[] {
  return rows.map((row) => {
    const { sourceLabel, ...config } = parseConfig(row.config) as ReturnType<typeof parseConfig> & { sourceLabel?: string };
    return {
      id: row.id,
      order: row.order,
      type: TYPE_FROM_DB[row.type],
      titleTh: row.titleTh,
      titleEn: row.titleEn ?? "",
      customLabel: row.customLabel ?? "",
      sourceLabel: sourceLabel ?? "",
      visibility: { desktop: row.visibleDesktop, tablet: row.visibleTablet, mobile: row.visibleMobile },
      columns: row.columns ?? undefined,
      itemsToShow: row.itemsToShow ?? undefined,
      config: { ...config, bodyEn: row.bodyEn ?? config.bodyEn },
    };
  });
}
