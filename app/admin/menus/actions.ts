"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { canDo } from "@/lib/admin-roles";

const navLinkSchema = z.object({
  labelTh: z.string().min(1, "จำเป็นต้องระบุชื่อเมนู").max(120),
  labelEn: z.string().max(120).optional().or(z.literal("")),
  // Empty href is allowed for a parent item that only hosts a hover dropdown for its
  // children (e.g. "อาคารโรงงาน") — NavDropdown.tsx renders it non-clickable in that case.
  href: z.string().max(300),
  parentId: z.string().nullable(),
});

type ActionResult = { error?: string };

function revalidateAll() {
  revalidatePath("/admin/menus");
  revalidateSite();
}

export async function createNavLink(input: z.infer<typeof navLinkSchema>): Promise<ActionResult> {
  await requirePermission("menu.create");
  const parsed = navLinkSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  const siblingCount = await prisma.navLink.count({
    where: { parentId: parsed.data.parentId, placement: "HEADER" },
  });

  await prisma.navLink.create({
    data: {
      labelTh: parsed.data.labelTh,
      labelEn: parsed.data.labelEn || null,
      href: parsed.data.href,
      parentId: parsed.data.parentId,
      order: siblingCount,
      placement: "HEADER",
    },
  });

  revalidateAll();
  return {};
}

export async function updateNavLink(id: string, input: z.infer<typeof navLinkSchema>): Promise<ActionResult> {
  await requirePermission("menu.edit");
  const parsed = navLinkSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };

  await prisma.navLink.update({
    where: { id },
    data: {
      labelTh: parsed.data.labelTh,
      labelEn: parsed.data.labelEn || null,
      href: parsed.data.href,
    },
  });

  revalidateAll();
  return {};
}

export async function deleteNavLink(id: string): Promise<ActionResult> {
  await requirePermission("menu.delete");
  await prisma.navLink.delete({ where: { id } });
  revalidateAll();
  return {};
}

export async function toggleNavLink(id: string, active: boolean): Promise<ActionResult> {
  await requirePermission("menu.edit");
  await prisma.navLink.update({ where: { id }, data: { active } });
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
  revalidateAll();
  return {};
}
