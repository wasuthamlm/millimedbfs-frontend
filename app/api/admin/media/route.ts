import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "ไม่พบไฟล์รูปภาพ" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "รองรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP, GIF, SVG)" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "ขนาดไฟล์ต้องไม่เกิน 5MB" }, { status: 400 });
  }

  const ext = path.extname(file.name) || `.${file.type.split("/")[1]}`;
  const filename = `${crypto.randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const url = `/uploads/${filename}`;
  const media = await prisma.media.create({
    data: { url, filename: file.name, mimeType: file.type, size: file.size },
  });

  return NextResponse.json({ id: media.id, url: media.url }, { status: 201 });
}
