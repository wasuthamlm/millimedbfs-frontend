"use server";

import { revalidatePath } from "next/cache";
import type { MessageStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";

function revalidateAll() {
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function setMessageStatus(ids: string[], status: MessageStatus): Promise<{ error?: string }> {
  const session = await requirePermission("contact.read");
  if (!ids.length) return {};
  await prisma.contactMessage.updateMany({ where: { id: { in: ids } }, data: { status } });
  // Opening a message marks it read — don't flood the log with that; only log explicit changes.
  if (ids.length > 1 || status !== "READ") {
    await logActivity(session.user, "status_change", "ContactMessage", { details: `${ids.length} ข้อความ → ${status}` });
  }
  revalidateAll();
  return {};
}

export async function deleteMessages(ids: string[]): Promise<{ error?: string }> {
  const session = await requirePermission("contact.delete");
  if (!ids.length) return {};
  await prisma.contactMessage.deleteMany({ where: { id: { in: ids } } });
  await logActivity(session.user, "delete", "ContactMessage", { details: `${ids.length} ข้อความ` });
  revalidateAll();
  return {};
}
