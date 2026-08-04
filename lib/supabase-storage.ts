import { createClient } from "@supabase/supabase-js";

const MEDIA_BUCKET = "media";

function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function uploadToStorage(path: string, buffer: Buffer, contentType: string) {
  const supabase = getServiceClient();
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, buffer, { contentType, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function ensureMediaBucket() {
  const supabase = getServiceClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  if (!buckets.some((b) => b.name === MEDIA_BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: "5MB",
    });
    if (createError) throw createError;
  }
}
