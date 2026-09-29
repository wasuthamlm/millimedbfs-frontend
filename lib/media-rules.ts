/** Upload rules shared by the browser uploader and the /api/admin/media routes. */

export type MediaKind = "image" | "video" | "document";

const RULES: { kind: MediaKind; types: string[]; maxBytes: number; label: string }[] = [
  {
    kind: "image",
    types: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"],
    maxBytes: 5 * 1024 * 1024,
    label: "รูปภาพ (JPG, PNG, WEBP, GIF, SVG, AVIF) ไม่เกิน 5MB",
  },
  {
    kind: "video",
    types: ["video/mp4", "video/webm", "video/quicktime"],
    maxBytes: 50 * 1024 * 1024,
    label: "วิดีโอ (MP4, WEBM, MOV) ไม่เกิน 50MB",
  },
  {
    kind: "document",
    types: ["application/pdf"],
    maxBytes: 20 * 1024 * 1024,
    label: "PDF ไม่เกิน 20MB",
  },
];

export function mediaKind(mimeType: string): MediaKind | null {
  return RULES.find((r) => r.types.includes(mimeType))?.kind ?? null;
}

export function acceptFor(kinds: MediaKind[]): string {
  return RULES.filter((r) => kinds.includes(r.kind)).flatMap((r) => r.types).join(",");
}

/** Returns a Thai error message, or null when the file is acceptable. */
export function validateUpload(mimeType: string, size: number, allowed: MediaKind[] = ["image", "video", "document"]): string | null {
  const rule = RULES.find((r) => r.types.includes(mimeType));
  const allowedRules = RULES.filter((r) => allowed.includes(r.kind));
  if (!rule || !allowed.includes(rule.kind)) {
    return `ไม่รองรับไฟล์ประเภทนี้ — รองรับ: ${allowedRules.map((r) => r.label).join(", ")}`;
  }
  if (size > rule.maxBytes) return `ไฟล์ใหญ่เกินไป — ${rule.label}`;
  return null;
}

/** Storage object names we issue: "<uuid>.<ext>". Anything else is rejected at registration. */
export const STORAGE_PATH_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{1,5}$/;

export function extensionFor(filename: string, mimeType: string): string {
  const fromName = /\.([a-z0-9]{1,5})$/i.exec(filename)?.[1];
  if (fromName) return fromName.toLowerCase();
  const sub = mimeType.split("/")[1] ?? "bin";
  return (sub === "svg+xml" ? "svg" : sub === "quicktime" ? "mov" : sub).slice(0, 5);
}
