"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";
import { canDo } from "@/lib/admin-roles";

const navLinkSchema = z.object({
  labelTh: z.string().min(1, "จำเป็นต้องระบุชื่อเมนู").max(120),
  labelEn: z.string().max(120).optional().or(z.literal("")),
  // Empty href is allowed for a parent item that only hosts a hover dropdown for its
  // children (e.g. "อาคารโรงงาน") — NavDropdown.tsx renders it non-clickable in that case.
  href: z.string().max(300),
  parentId: z.string().nullable(),
  openInNewTab: z.boolean().optional(),
});

const MAX_DEPTH = 3;

async function depthOf(id: string | null): Promise<number> {
  let depth = 0;
  for (let cur = id; cur; depth++) {
    const row = await prisma.navLink.findUnique({ where: { id: cur }, select: { parentId: true } });
    cur = row?.parentId ?? null;
  }
  return depth;
}

async function subtreeHeight(id: string): Promise<number> {
  const children = await prisma.navLink.findMany({ where: { parentId: id }, select: { id: true } });
  if (!children.length) return 1;
  return 1 + Math.max(...(await Promise.all(children.map((c) => subtreeHeight(c.id)))));
}

async function isDescendant(ancestorId: string, id: string | null): Promise<boolean> {
  for (let cur = id; cur; ) {
    if (cur === ancestorId) return true;
    cur = (await prisma.navLink.findUnique({ where: { id: cur }, select: { parentId: true } }))?.parentId ?? null;
  }
  return false;
}

type ActionResult = { error?: string };

function revalidateAll() {
  revalidatePath("/admin/menus");
  revalidateSite();
}

export async function createNavLink(input: z.infer<typeof navLinkSchema>): Promise<ActionResult> {
  const session = await requirePermission("menu.create");
  const parsed = navLinkSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  if ((await depthOf(parsed.data.parentId)) >= MAX_DEPTH) return { error: `เมนูลึกได้ไม่เกิน ${MAX_DEPTH} ระดับ` };
  const siblingCount = await prisma.navLink.count({
    where: { parentId: parsed.data.parentId, placement: "HEADER" },
  });

  await prisma.navLink.create({
    data: {
      labelTh: parsed.data.labelTh,
      labelEn: parsed.data.labelEn || null,
      href: parsed.data.href,
      parentId: parsed.data.parentId,
      openInNewTab: parsed.data.openInNewTab ?? false,
      order: siblingCount,
      placement: "HEADER",
    },
  });

  await logActivity(session.user, "create", "NavLink", { targetLabel: parsed.data.labelTh });

  revalidateAll();
  return {};
}

export async function updateNavLink(id: string, input: z.infer<typeof navLinkSchema>): Promise<ActionResult> {
  const session = await requirePermission("menu.edit");
  const parsed = navLinkSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const existing = await prisma.navLink.findUnique({ where: { id } });
  if (!existing) return { error: "ไม่พบเมนู" };
  const newParent = parsed.data.parentId;
  const moving = newParent !== existing.parentId;
  if (moving) {
    if (newParent === id || (await isDescendant(id, newParent))) return { error: "ย้ายเมนูไปอยู่ใต้ตัวเองไม่ได้" };
    if ((await depthOf(newParent)) + (await subtreeHeight(id)) > MAX_DEPTH) return { error: `เมนูลึกได้ไม่เกิน ${MAX_DEPTH} ระดับ` };
    // Moving a top-level menu is a top-level reorder, which contributors can't do.
    if ((existing.parentId === null || newParent === null) && !canDo(session.user.role, "menu.reorder-top")) {
      return { error: "Contributor ไม่สามารถย้ายเมนูหลักได้" };
    }
  }

  await prisma.navLink.update({
    where: { id },
    data: {
      labelTh: parsed.data.labelTh,
      labelEn: parsed.data.labelEn || null,
      href: parsed.data.href,
      openInNewTab: parsed.data.openInNewTab ?? existing.openInNewTab,
      ...(moving ? { parentId: newParent, order: await prisma.navLink.count({ where: { parentId: newParent, placement: "HEADER" } }) } : {}),
    },
  });

  await logActivity(session.user, "update", "NavLink", { targetId: id, targetLabel: parsed.data.labelTh });

  revalidateAll();
  return {};
}

export async function deleteNavLink(id: string): Promise<ActionResult> {
  const session = await requirePermission("menu.delete");
  await prisma.navLink.delete({ where: { id } });
  await logActivity(session.user, "delete", "NavLink", { targetId: id });
  revalidateAll();
  return {};
}

export async function toggleNavLink(id: string, active: boolean): Promise<ActionResult> {
  const session = await requirePermission("menu.edit");
  await prisma.navLink.update({ where: { id }, data: { active } });
  await logActivity(session.user, (active ? "enable" : "disable"), "NavLink", { targetId: id });
  revalidateAll();
  return {};
}

export async function reorderNavLinks(ids: string[]): Promise<ActionResult> {
  const session = await requirePermission("menu.edit");
  if (!canDo(session.user.role, "menu.reorder-top")) {
    const topLevel = await prisma.navLink.count({ where: { id: { in: ids }, parentId: null } });
    if (topLevel > 0) return { error: "Contributor ไม่สามารถจัดลำดับเมนูหลักได้" };
  }
  await prisma.$transaction(
    ids.map((id, index) => prisma.navLink.update({ where: { id }, data: { order: index } }))
  );
  await logActivity(session.user, "reorder", "NavLink");
  revalidateAll();
  return {};
}
