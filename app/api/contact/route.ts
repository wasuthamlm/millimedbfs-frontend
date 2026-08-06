import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.email(),
  phone: z.string().max(32).optional().or(z.literal("")),
  subject: z.string().max(200).optional().or(z.literal("")),
  body: z.string().min(1).max(4000),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" }, { status: 400 });
  }

  const { name, email, phone, subject, body: message } = parsed.data;

  await prisma.contactMessage.create({
    data: {
      name,
      email,
      phone: phone || null,
      subject: subject || null,
      body: message,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
