import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Admin audit trail (ported from the legacy site's src/lib/activityLog.js).
 * Call after a successful mutation in an admin server action. Logging never
 * throws — a failed log write must not fail the action it describes.
 */

export type ActivityAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "status_change"
  | "trash"
  | "restore"
  | "reorder"
  | "role_change"
  | "enable"
  | "disable"
  | "password_reset"
  | "translate"
  | "upload"
  | "login";

type Actor = { id?: string | null; email?: string | null; name?: string | null };

export async function logActivity(
  actor: Actor,
  action: ActivityAction,
  targetType: string,
  opts: {
    targetId?: string | null;
    targetLabel?: string | null;
    details?: string | null;
    changedFields?: string[];
    data?: Prisma.InputJsonValue;
  } = {},
) {
  try {
    const details: Record<string, Prisma.InputJsonValue> = {};
    if (opts.details) details.note = opts.details;
    if (opts.changedFields?.length) details.changedFields = opts.changedFields;
    if (opts.data !== undefined) details.data = opts.data;
    await prisma.activityLog.create({
      data: {
        actorId: actor.id ?? null,
        actorEmail: actor.email ?? "unknown",
        actorName: actor.name ?? null,
        action,
        targetType,
        targetId: opts.targetId ?? null,
        targetLabel: opts.targetLabel ?? null,
        details: Object.keys(details).length ? details : undefined,
      },
    });
  } catch (err) {
    console.error("[activity-log] failed to record", action, targetType, err);
  }
}

/** Top-level keys of `next` whose JSON value differs from `prev` (system fields ignored). */
export function diffFields(prev: object | null | undefined, next: object): string[] {
  if (!prev) return [];
  const skip = new Set(["id", "createdAt", "updatedAt"]);
  const before = prev as Record<string, unknown>;
  return Object.entries(next)
    .filter(([key, value]) => !skip.has(key) && value !== undefined)
    .filter(([key, value]) => JSON.stringify(before[key] ?? null) !== JSON.stringify(value ?? null))
    .map(([key]) => key);
}

/** Thai labels for the activity log page. */
export const ACTION_LABELS: Record<string, string> = {
  create: "สร้าง",
  update: "แก้ไข",
  delete: "ลบ",
  publish: "เผยแพร่",
  unpublish: "ยกเลิกเผยแพร่",
  status_change: "เปลี่ยนสถานะ",
  trash: "ย้ายไปถังขยะ",
  restore: "กู้คืน",
  reorder: "จัดลำดับ",
  role_change: "เปลี่ยนสิทธิ์",
  enable: "เปิดใช้งาน",
  disable: "ปิดใช้งาน",
  password_reset: "รีเซ็ตรหัสผ่าน",
  translate: "แปลภาษา",
  upload: "อัปโหลด",
  login: "เข้าสู่ระบบ",
};

export const TARGET_LABELS: Record<string, string> = {
  Post: "บทความ",
  Product: "สินค้า",
  ProductCategory: "หมวดหมู่สินค้า",
  ArticleCategory: "ประเภทบทความ",
  Page: "หน้าเว็บ",
  LandingPage: "Landing Page",
  NavLink: "เมนู",
  Media: "สื่อ",
  MediaFolder: "โฟลเดอร์สื่อ",
  Banner: "แบนเนอร์",
  Popup: "Popup",
  Widget: "Widget",
  Header: "Header",
  Footer: "Footer",
  Settings: "การตั้งค่า",
  User: "ผู้ใช้",
  ContactMessage: "ข้อความติดต่อ",
  Translation: "คำแปล",
  CookieConsent: "Cookie Consent",
  PageHero: "Page Hero",
};
