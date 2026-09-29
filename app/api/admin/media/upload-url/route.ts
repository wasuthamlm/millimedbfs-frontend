import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/require-admin";
import { createSignedUpload } from "@/lib/supabase-storage";
import { extensionFor, validateUpload } from "@/lib/media-rules";

// Step 1 of an upload: validate the file's type/size and hand the browser a
// signed URL to PUT it to storage directly. Step 2 is POST /api/admin/media.

const bodySchema = z.object({
  filename: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  size: z.number().int().positive(),
});

export async function POST(request: Request) {
  try {
    await requirePermission("media.upload");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  const { filename, type, size } = parsed.data;

  const invalid = validateUpload(type, size);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const path = `${crypto.randomUUID()}.${extensionFor(filename, type)}`;
  try {
    const signedUrl = await createSignedUpload(path);
    return NextResponse.json({ path, signedUrl });
  } catch {
    return NextResponse.json({ error: "สร้างลิงก์อัปโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
