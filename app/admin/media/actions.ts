"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { diffFields, logActivity } from "@/lib/activity-log";
import { deleteFromStorage } from "@/lib/supabase-storage";

function revalidateAll() {
  revalidatePath("/admin/media");
}

export async function createMediaFolder(name: string): Promise<{ error?: string; id?: string }> {
  const session = await requirePermission("media.upload");

  const trimmed = name.trim();
  if (!trimmed) return { error: "กรุณาระบุชื่อโฟลเดอร์" };

  const existing = await prisma.mediaFolder.findFirst({ where: { name: trimmed } });
  if (existing) return { error: "มีโฟลเดอร์นี้อยู่แล้ว" };

  const folder = await prisma.mediaFolder.create({ data: { name: trimmed } });
  await logActivity(session.user, "create", "MediaFolder", { targetId: folder.id, targetLabel: trimmed });
  revalidateAll();
  return { id: folder.id };
}

export async function deleteMediaFolder(id: string): Promise<{ error?: string }> {
  const session = await requirePermission("media.delete");
  await prisma.mediaFolder.delete({ where: { id } });
  await logActivity(session.user, "delete", "MediaFolder", { targetId: id });
  revalidateAll();
  return {};
}

export async function setMediaFolder(ids: string[], folderId: string | null): Promise<{ error?: string }> {
  const session = await requirePermission("media.upload");
  if (ids.length === 0) return {};

  await prisma.media.updateMany({ where: { id: { in: ids } }, data: { folderId } });
  await logActivity(session.user, "update", "Media", { details: `ย้าย ${ids.length} ไฟล์` });
  revalidateAll();
  return {};
}

export async function deleteMedia(ids: string[]): Promise<{ error?: string }> {
  const session = await requirePermission("media.delete");
  if (ids.length === 0) return {};

  const items = await prisma.media.findMany({ where: { id: { in: ids } } });
  await prisma.media.deleteMany({ where: { id: { in: ids } } });
  await Promise.all(items.map((item) => deleteFromStorage(item.url).catch(() => {})));

  await logActivity(session.user, "delete", "Media", { details: `ลบ ${ids.length} ไฟล์` });

  revalidateAll();
  return {};
}

const mediaMetaSchema = z.object({
  filename: z.string().trim().min(1, "กรุณาระบุชื่อไฟล์").max(255),
  altTh: z.string().max(300),
  altEn: z.string().max(300),
  captionTh: z.string().max(500),
  captionEn: z.string().max(500),
});

export async function updateMediaMeta(id: string, input: z.infer<typeof mediaMetaSchema>): Promise<{ error?: string }> {
  const session = await requirePermission("media.upload");
  const parsed = mediaMetaSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const existing = await prisma.media.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบไฟล์" };

  const data = {
    filename: parsed.data.filename,
    altTh: parsed.data.altTh || null,
    altEn: parsed.data.altEn || null,
    captionTh: parsed.data.captionTh || null,
    captionEn: parsed.data.captionEn || null,
  };
  await prisma.media.update({ where: { id }, data });
  await logActivity(session.user, "update", "Media", {
    targetId: id,
    targetLabel: data.filename,
    changedFields: diffFields(existing, data),
  });
  revalidateAll();
  return {};
}

export async function renameMediaFolder(id: string, name: string): Promise<{ error?: string }> {
  const session = await requirePermission("media.upload");
  const trimmed = name.trim();
  if (!trimmed) return { error: "กรุณาระบุชื่อโฟลเดอร์" };
  const clash = await prisma.mediaFolder.findFirst({ where: { name: trimmed, NOT: { id } } });
  if (clash) return { error: "มีโฟลเดอร์นี้อยู่แล้ว" };

  await prisma.mediaFolder.update({ where: { id }, data: { name: trimmed } });
  await logActivity(session.user, "update", "MediaFolder", { targetId: id, targetLabel: trimmed });
  revalidateAll();
  return {};
}

export type PickerMedia = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  altTh: string | null;
  width: number | null;
  height: number | null;
};

const PICKER_PAGE_SIZE = 30;

/** Paged media list for the "choose from library" dialog. */
export async function listMediaForPicker(input: {
  q?: string;
  folderId?: string | null;
  kind?: "image" | "video" | "document" | "all";
  page?: number;
}): Promise<{ items: PickerMedia[]; totalPages: number; folders: { id: string; name: string }[] }> {
  await requirePermission("media.upload");
  const page = Math.max(1, input.page ?? 1);
  const mimeFilter =
    input.kind === "image"
      ? { mimeType: { startsWith: "image/" } }
      : input.kind === "video"
        ? { mimeType: { startsWith: "video/" } }
        : input.kind === "document"
          ? { mimeType: "application/pdf" }
          : {};
  const where = {
    ...mimeFilter,
    ...(input.q ? { filename: { contains: input.q, mode: "insensitive" as const } } : {}),
    ...(input.folderId === "uncategorized" ? { folderId: null } : input.folderId ? { folderId: input.folderId } : {}),
  };
  const [items, total, folders] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PICKER_PAGE_SIZE,
      skip: (page - 1) * PICKER_PAGE_SIZE,
      select: { id: true, url: true, filename: true, mimeType: true, altTh: true, width: true, height: true },
    }),
    prisma.media.count({ where }),
    prisma.mediaFolder.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
  ]);
  return { items, totalPages: Math.max(1, Math.ceil(total / PICKER_PAGE_SIZE)), folders };
}
