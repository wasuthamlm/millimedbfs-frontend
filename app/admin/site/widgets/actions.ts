"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { revalidateSite } from "@/lib/revalidate-site";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";
import type { Widget } from "@/data/admin-widgets";

export async function saveWidgets(widgets: Widget[]) {
  const session = await requirePermission("widget.edit");

  await prisma.$transaction(
    widgets.map((widget) =>
      prisma.widget.update({
        where: { id: widget.id },
        data: { enabled: widget.enabled, link: widget.link || null },
      })
    )
  );

  await logActivity(session.user, "update", "Widget");

  revalidatePath("/admin/site/widgets");
  revalidateSite();
}

// ───────────────────────── Custom floating buttons (legacy Widget entity) ─────────────────────────

const floatSchema = z.object({
  labelTh: z.string().trim().min(1, "กรุณาระบุข้อความปุ่ม").max(60),
  labelEn: z.string().max(60),
  type: z.enum(["line", "phone", "url", "signup", "login"]),
  icon: z.enum(["message", "phone", "mail", "user-plus", "log-in", "shopping-bag", "external-link"]),
  link: z.string().max(500),
  phone: z.string().max(30),
  position: z.enum(["bottom-right", "bottom-left", "middle-right", "middle-left"]),
  design: z.enum(["pill", "circle", "square", "minimal"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "สีต้องเป็นรหัส hex 6 หลัก"),
  openInNewTab: z.boolean(),
  enabled: z.boolean(),
});

export type FloatingWidgetInput = z.infer<typeof floatSchema>;

function checkTarget(data: FloatingWidgetInput): string | null {
  if (data.type === "phone") return /^[0-9+() -]{6,20}$/.test(data.phone) ? null : "เบอร์โทรไม่ถูกต้อง";
  // Only site paths and http(s) links — never javascript: etc. (legacy safeUrl guard).
  return /^(\/|https?:\/\/)/.test(data.link) ? null : "ลิงก์ต้องขึ้นต้นด้วย / หรือ https://";
}

export async function saveFloatingWidget(id: string | null, input: FloatingWidgetInput): Promise<{ error?: string }> {
  const session = await requirePermission("widget.edit");
  const parsed = floatSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  const targetError = checkTarget(parsed.data);
  if (targetError) return { error: targetError };
  const data = {
    ...parsed.data,
    name: parsed.data.labelTh,
    link: parsed.data.type === "phone" ? null : parsed.data.link,
    phone: parsed.data.type === "phone" ? parsed.data.phone : null,
  };
  if (id) {
    await prisma.widget.update({ where: { id }, data });
  } else {
    const order = await prisma.widget.count({ where: { type: { not: null } } });
    await prisma.widget.create({ data: { ...data, key: `float-${crypto.randomUUID()}`, order } });
  }
  await logActivity(session.user, id ? "update" : "create", "Widget", { targetId: id, targetLabel: data.labelTh });
  revalidatePath("/admin/site/widgets");
  revalidateSite();
  return {};
}

export async function deleteFloatingWidget(id: string): Promise<{ error?: string }> {
  const session = await requirePermission("widget.delete");
  const w = await prisma.widget.findUnique({ where: { id } });
  if (!w?.type) return { error: "ลบได้เฉพาะปุ่มลอยที่สร้างเอง" };
  await prisma.widget.delete({ where: { id } });
  await logActivity(session.user, "delete", "Widget", { targetId: id, targetLabel: w.labelTh ?? w.name });
  revalidatePath("/admin/site/widgets");
  revalidateSite();
  return {};
}

export async function reorderFloatingWidgets(ids: string[]) {
  const session = await requirePermission("widget.edit");
  await prisma.$transaction(ids.map((id, order) => prisma.widget.update({ where: { id }, data: { order } })));
  await logActivity(session.user, "reorder", "Widget");
  revalidatePath("/admin/site/widgets");
  revalidateSite();
  return {};
}
