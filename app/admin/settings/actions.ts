"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "กรุณาระบุรหัสผ่านปัจจุบัน"),
  newPassword: z.string().min(8, "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร").max(72),
});

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ error?: string }> {
  const session = await requireAdmin();
  const email = session?.user?.email;
  if (!email) {
    return { error: "ไม่พบข้อมูลผู้ใช้ในเซสชัน" };
  }

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    return { error: "ไม่พบบัญชีผู้ใช้" };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { email }, data: { passwordHash } });

  return {};
}
