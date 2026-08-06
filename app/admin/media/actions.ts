"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { deleteFromStorage } from "@/lib/supabase-storage";

function revalidateAll() {
  revalidatePath("/admin/media");
}

export async function createMediaFolder(name: string): Promise<{ error?: string; id?: string }> {
  await requireAdmin();

  const trimmed = name.trim();
  if (!trimmed) return { error: "กรุณาระบุชื่อโฟลเดอร์" };

  const existing = await prisma.mediaFolder.findFirst({ where: { name: trimmed } });
  if (existing) return { error: "มีโฟลเดอร์นี้อยู่แล้ว" };

  const folder = await prisma.mediaFolder.create({ data: { name: trimmed } });
  revalidateAll();
  return { id: folder.id };
}

export async function deleteMediaFolder(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  await prisma.mediaFolder.delete({ where: { id } });
  revalidateAll();
  return {};
}

export async function setMediaFolder(ids: string[], folderId: string | null): Promise<{ error?: string }> {
  await requireAdmin();
  if (ids.length === 0) return {};

  await prisma.media.updateMany({ where: { id: { in: ids } }, data: { folderId } });
  revalidateAll();
  return {};
}

export async function deleteMedia(ids: string[]): Promise<{ error?: string }> {
  await requireAdmin();
  if (ids.length === 0) return {};

  const items = await prisma.media.findMany({ where: { id: { in: ids } } });
  await prisma.media.deleteMany({ where: { id: { in: ids } } });
  await Promise.all(items.map((item) => deleteFromStorage(item.url).catch(() => {})));

  revalidateAll();
  return {};
}
