import type { prisma } from "@/lib/prisma";

/** The shared client or the `tx` handed to prisma.$transaction(async (tx) => ...). */
type Db = Pick<typeof prisma, "media">;

export async function getOrCreateMedia(
  client: Db,
  url: string,
) {
  const existing = await client.media.findFirst({ where: { url } });
  if (existing) return existing;
  return client.media.create({
    data: { url, filename: url.split("/").pop() ?? "media", mimeType: "image/svg+xml", size: 0 },
  });
}
