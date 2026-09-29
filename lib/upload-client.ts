"use client";

import { validateUpload, type MediaKind } from "@/lib/media-rules";

export type UploadedMedia = { id: string; url: string };

async function imageSize(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return {};
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return {};
  }
}

/**
 * Uploads a file to the media library: get a signed URL, PUT the file straight
 * to storage, then register it. Throws an Error with a Thai message on failure.
 */
export async function uploadMedia(
  file: File,
  opts: { folderId?: string | null; allowed?: MediaKind[] } = {},
): Promise<UploadedMedia> {
  const invalid = validateUpload(file.type, file.size, opts.allowed);
  if (invalid) throw new Error(invalid);

  const signRes = await fetch("/api/admin/media/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, type: file.type, size: file.size }),
  });
  const sign = await signRes.json().catch(() => null);
  if (!signRes.ok || !sign?.signedUrl) throw new Error(sign?.error ?? "อัปโหลดไม่สำเร็จ");

  // Same multipart shape supabase-js' uploadToSignedUrl sends.
  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", file);
  const putRes = await fetch(sign.signedUrl, { method: "PUT", headers: { "x-upsert": "false" }, body });
  if (!putRes.ok) throw new Error("อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");

  const registerRes = await fetch("/api/admin/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: sign.path,
      filename: file.name,
      type: file.type,
      size: file.size,
      folderId: opts.folderId ?? null,
      ...(await imageSize(file)),
    }),
  });
  const registered = await registerRes.json().catch(() => null);
  if (!registerRes.ok || !registered?.url) throw new Error(registered?.error ?? "บันทึกไฟล์ไม่สำเร็จ");
  return registered as UploadedMedia;
}
