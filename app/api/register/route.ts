import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.email(),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  if (isRateLimited(`register:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "สมัครสมาชิกบ่อยเกินไป กรุณาลองใหม่ภายหลัง" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { name, email, passwordHash, role: "CUSTOMER" },
    });
  } catch {
    return NextResponse.json({ error: "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
