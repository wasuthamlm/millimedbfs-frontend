import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { getSiteConfig, SITE_CONFIG_KEYS } from "@/lib/site-config";
import { DEFAULT_CONTACT_CONFIG, normalizeContactConfig, validateContact } from "@/lib/contact-config";

const bodySchema = z.object({
  name: z.string().max(120).default(""),
  email: z.string().max(200).default(""),
  phone: z.string().max(32).default(""),
  subject: z.string().max(200).default(""),
  body: z.string().max(4000).default(""),
  custom: z.record(z.string().max(64), z.union([z.string().max(1000), z.boolean()])).default({}),
  lang: z.enum(["th", "en"]).default("th"),
});

export async function POST(request: Request) {
  if (isRateLimited(`contact:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "ส่งข้อความบ่อยเกินไป กรุณาลองใหม่ภายหลัง" }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" }, { status: 400 });
  }
  const data = parsed.data;

  // Validate against the admin-configured form so a crafted request can't skip required fields.
  const config = normalizeContactConfig(await getSiteConfig(SITE_CONFIG_KEYS.contact, DEFAULT_CONTACT_CONFIG));
  const errors = validateContact(
    { name: data.name, email: data.email, phone: data.phone, subject: data.subject, message: data.body, custom: data.custom },
    config,
    data.lang,
  );
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: "กรุณาตรวจสอบข้อมูลที่กรอก", fieldErrors: errors }, { status: 400 });
  }

  // Store custom answers under their (Thai) labels so the inbox stays readable
  // even if the field is later renamed or removed.
  const customFields: Record<string, string> = {};
  for (const f of config.customFields) {
    const v = data.custom[f.id];
    if (v === undefined || v === "" || v === false) continue;
    customFields[f.labelTh] = v === true ? "✓" : String(v);
  }

  try {
    const message = await prisma.contactMessage.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim() || null,
        phone: data.phone.trim() || null,
        subject: data.subject.trim() || null,
        body: data.body.trim(),
        customFields: Object.keys(customFields).length ? customFields : undefined,
      },
      select: { id: true },
    });
    // The id lets the page fire generate_lead exactly once per real submission.
    return NextResponse.json({ ok: true, id: message.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
