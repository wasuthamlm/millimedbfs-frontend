"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { canDo } from "@/lib/admin-roles";
import { diffFields, logActivity } from "@/lib/activity-log";

const text = (max: number) => z.string().max(max).optional().or(z.literal(""));

const popupSchema = z.object({
  titleTh: text(200),
  titleEn: text(200),
  bodyTh: text(2000),
  bodyEn: text(2000),
  imageUrl: z.string().url().optional().or(z.literal("")),
  buttonLabelTh: text(80),
  buttonLabelEn: text(80),
  link: z
    .string()
    .max(500)
    .regex(/^(\/|https?:\/\/|tel:|mailto:|#)/, "ลิงก์ต้องขึ้นต้นด้วย / หรือ https://")
    .optional()
    .or(z.literal("")),
  openInNewTab: z.boolean(),
  layout: z.enum(["image-top", "image-left", "image-only", "text-only"]),
  animation: z.enum(["fade", "zoom", "slide-up", "slide-down", "bounce"]),
  size: z.enum(["sm", "md", "lg"]),
  delaySeconds: z.number().int().min(0).max(60),
  frequency: z.enum(["always", "once_per_session", "once_per_day"]),
  homeOnly: z.boolean(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  active: z.boolean(),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
});

export type PopupInput = z.infer<typeof popupSchema>;

function revalidateAll() {
  revalidatePath("/admin/site/popup");
  revalidatePath("/admin");
  revalidateSite();
}

function toData(data: PopupInput) {
  const n = (v?: string) => v?.trim() || null;
  const date = (v?: string) => (v ? new Date(`${v.slice(0, 10)}T00:00:00+07:00`) : null);
  return {
    titleTh: n(data.titleTh),
    titleEn: n(data.titleEn),
    bodyTh: n(data.bodyTh),
    bodyEn: n(data.bodyEn),
    imageUrl: n(data.imageUrl),
    buttonLabelTh: n(data.buttonLabelTh),
    buttonLabelEn: n(data.buttonLabelEn),
    link: n(data.link),
    openInNewTab: data.openInNewTab,
    layout: data.layout,
    animation: data.animation,
    size: data.size,
    delaySeconds: data.delaySeconds,
    frequency: data.frequency,
    homeOnly: data.homeOnly,
    status: data.status,
    active: data.active,
    startDate: date(data.startDate),
    endDate: date(data.endDate),
  };
}

function parse(input: PopupInput, role: string): { data: PopupInput } | { error: string } {
  const parsed = popupSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  if (!parsed.data.imageUrl && !parsed.data.titleTh && !parsed.data.bodyTh) return { error: "ใส่รูปภาพ หรือหัวข้อ/ข้อความ อย่างน้อยหนึ่งอย่าง" };
  // Contributors can edit but never publish.
  if (!canDo(role, "popup.publish")) parsed.data.status = "DRAFT";
  return { data: parsed.data };
}

export async function createPopup(input: PopupInput): Promise<{ error?: string; id?: string }> {
  const session = await requirePermission("popup.edit");
  const parsed = parse(input, session.user.role);
  if ("error" in parsed) return { error: parsed.error };
  const order = await prisma.popup.count({ where: { deletedAt: null } });
  const popup = await prisma.popup.create({ data: { ...toData(parsed.data), order } });
  await logActivity(session.user, "create", "Popup", { targetId: popup.id, targetLabel: popup.titleTh ?? "Popup" });
  revalidateAll();
  return { id: popup.id };
}

export async function updatePopup(id: string, input: PopupInput): Promise<{ error?: string }> {
  const session = await requirePermission("popup.edit");
  const parsed = parse(input, session.user.role);
  if ("error" in parsed) return { error: parsed.error };
  const existing = await prisma.popup.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบ Popup" };
  const data = toData(parsed.data);
  await prisma.popup.update({ where: { id }, data });
  await logActivity(session.user, existing.status !== "PUBLISHED" && data.status === "PUBLISHED" ? "publish" : "update", "Popup", {
    targetId: id,
    targetLabel: data.titleTh ?? "Popup",
    changedFields: diffFields(existing, data),
  });
  revalidateAll();
  return {};
}

export async function setPopupsStatus(ids: string[], status: "DRAFT" | "PUBLISHED") {
  const session = await requirePermission("popup.publish");
  await prisma.popup.updateMany({ where: { id: { in: ids } }, data: { status } });
  await logActivity(session.user, status === "PUBLISHED" ? "publish" : "unpublish", "Popup", { details: `${ids.length} รายการ` });
  revalidateAll();
  return {};
}
export async function publishPopups(ids: string[]) {
  return setPopupsStatus(ids, "PUBLISHED");
}
export async function draftPopups(ids: string[]) {
  return setPopupsStatus(ids, "DRAFT");
}

export async function setPopupsActive(ids: string[], active: boolean) {
  const session = await requirePermission("popup.edit");
  await prisma.popup.updateMany({ where: { id: { in: ids } }, data: { active } });
  await logActivity(session.user, active ? "enable" : "disable", "Popup", { details: `${ids.length} รายการ` });
  revalidateAll();
  return {};
}
export async function activatePopups(ids: string[]) {
  return setPopupsActive(ids, true);
}
export async function deactivatePopups(ids: string[]) {
  return setPopupsActive(ids, false);
}

export async function reorderPopups(ids: string[]) {
  const session = await requirePermission("popup.edit");
  await prisma.$transaction(ids.map((id, order) => prisma.popup.update({ where: { id }, data: { order } })));
  await logActivity(session.user, "reorder", "Popup");
  revalidateAll();
  return {};
}

export async function trashPopups(ids: string[]) {
  const session = await requirePermission("popup.delete");
  await prisma.popup.updateMany({ where: { id: { in: ids } }, data: { deletedAt: new Date(), active: false } });
  await logActivity(session.user, "trash", "Popup", { details: `${ids.length} รายการ` });
  revalidateAll();
  return {};
}
export async function restorePopups(ids: string[]) {
  const session = await requirePermission("popup.delete");
  await prisma.popup.updateMany({ where: { id: { in: ids } }, data: { deletedAt: null } });
  await logActivity(session.user, "restore", "Popup", { details: `${ids.length} รายการ` });
  revalidateAll();
  return {};
}
export async function purgePopups(ids: string[]) {
  const session = await requirePermission("popup.delete");
  const { count } = await prisma.popup.deleteMany({ where: { id: { in: ids }, deletedAt: { not: null } } });
  await logActivity(session.user, "delete", "Popup", { details: `ลบถาวร ${count} รายการ` });
  revalidateAll();
  return {};
}
export async function emptyPopupTrash() {
  const session = await requirePermission("popup.delete");
  const { count } = await prisma.popup.deleteMany({ where: { deletedAt: { not: null } } });
  await logActivity(session.user, "delete", "Popup", { details: `ล้างถังขยะ ${count} รายการ` });
  revalidateAll();
  return {};
}
