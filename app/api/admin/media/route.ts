import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { logActivity } from "@/lib/activity-log";
import { publicUrlFor, storageObjectExists } from "@/lib/supabase-storage";
import { STORAGE_PATH_RE, validateUpload } from "@/lib/media-rules";

// Step 2 of an upload (see ./upload-url): the browser has PUT the file to
// storage; record it in the media library. Ported from Base44's registerMediaAsset.

const bodySchema = z.object({
  path: z.string().regex(STORAGE_PATH_RE),
  filename: z.string().min(1).max(255),
  type: z.string().min(1).max(100),
  size: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  folderId: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  let session;
  try {
    session = await requirePermission("media.upload");
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  const data = parsed.data;

  const invalid = validateUpload(data.type, data.size);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  try {
    if (!(await storageObjectExists(data.path))) {
      return NextResponse.json({ error: "ไม่พบไฟล์ที่อัปโหลด กรุณาลองใหม่อีกครั้ง" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "ตรวจสอบไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }

  const folderId =
    data.folderId && (await prisma.mediaFolder.count({ where: { id: data.folderId } })) ? data.folderId : null;

  const media = await prisma.media.create({
    data: {
      url: publicUrlFor(data.path),
      filename: data.filename,
      mimeType: data.type,
      size: data.size,
      width: data.width ?? null,
      height: data.height ?? null,
      folderId,
      uploadedById: session.user.id,
      source: "upload",
    },
  });
  await logActivity(session.user, "upload", "Media", { targetId: media.id, targetLabel: media.filename });

  return NextResponse.json({ id: media.id, url: media.url }, { status: 201 });
}
