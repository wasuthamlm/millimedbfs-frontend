"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/lib/generated/prisma/client";
import type { Role } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

function revalidateAll() {
  revalidatePath("/admin/users");
}

const createUserSchema = z.object({
  name: z.string().min(1, "จำเป็นต้องระบุชื่อ").max(120),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  role: z.enum(["ADMIN", "APPROVER", "CONTRIBUTOR"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UserActionResult = { error?: string };

export async function createUser(input: CreateUserInput): Promise<UserActionResult> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }
  const data = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(data.password, 10);
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role as Role,
        // Admin-created accounts skip self-service email verification.
        emailVerified: new Date(),
      },
    });
    revalidateAll();
    return {};
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "อีเมลนี้ถูกใช้แล้ว" };
    }
    throw err;
  }
}

export async function setUserRole(id: string, role: Role): Promise<UserActionResult> {
  const session = await requireAdmin();
  if (session.user?.id === id && role !== "ADMIN") {
    return { error: "ไม่สามารถลดสิทธิ์ของบัญชีตัวเองได้" };
  }
  await prisma.user.update({ where: { id }, data: { role } });
  revalidateAll();
  return {};
}

export async function setUserDisabled(id: string, disabled: boolean): Promise<UserActionResult> {
  const session = await requireAdmin();
  if (session.user?.id === id) {
    return { error: "ไม่สามารถปิดใช้งานบัญชีตัวเองได้" };
  }
  await prisma.user.update({ where: { id }, data: { disabled } });
  revalidateAll();
  return {};
}

export async function resetUserPassword(id: string, newPassword: string): Promise<UserActionResult> {
  await requireAdmin();
  const parsed = z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร").safeParse(newPassword);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "รหัสผ่านไม่ถูกต้อง" };
  }
  const passwordHash = await bcrypt.hash(parsed.data, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  revalidateAll();
  return {};
}

export async function deleteUser(id: string): Promise<UserActionResult> {
  const session = await requireAdmin();
  if (session.user?.id === id) {
    return { error: "ไม่สามารถลบบัญชีตัวเองได้" };
  }
  await prisma.user.delete({ where: { id } });
  revalidateAll();
  return {};
}
