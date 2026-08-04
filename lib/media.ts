import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getOrCreateMedia(
  client: Prisma.TransactionClient | typeof prisma,
  url: string,
) {
  const existing = await client.media.findFirst({ where: { url } });
  if (existing) return existing;
  return client.media.create({
    data: { url, filename: url.split("/").pop() ?? "media", mimeType: "image/svg+xml", size: 0 },
  });
}
