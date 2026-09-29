import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { MediaLibraryClient } from "@/components/admin/media/MediaLibraryClient";
import { getMediaUsage } from "@/lib/media-usage";
import { getAdminRole } from "@/lib/require-admin";
import { canDo } from "@/lib/admin-roles";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; q?: string; page?: string }>;
}) {
  const { folder, q, page: pageParam } = await searchParams;
  const activeFolder = folder ?? "all";
  const page = Math.max(1, Number(pageParam) || 1);

  // Usage has to be computed in code (URLs inside rich text / JSON config can't
  // be expressed as a Prisma relation filter), so the "unused" filter becomes
  // an id list.
  const [usage, role] = await Promise.all([getMediaUsage(), getAdminRole()]);
  const unusedFilter: Prisma.MediaWhereInput = { id: { notIn: [...usage.keys()] } };

  const where: Prisma.MediaWhereInput = {
    ...(q ? { filename: { contains: q, mode: "insensitive" } } : {}),
    ...(activeFolder === "uncategorized"
      ? { folderId: null }
      : activeFolder === "unused"
        ? unusedFilter
        : activeFolder !== "all"
          ? { folderId: activeFolder }
          : {}),
  };

  const [media, totalCount, folders, totalAll, uncategorizedCount, unusedCount] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      include: { folder: true },
    }),
    prisma.media.count({ where }),
    prisma.mediaFolder.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { media: true } } },
    }),
    prisma.media.count(),
    prisma.media.count({ where: { folderId: null } }),
    prisma.media.count({ where: unusedFilter }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <MediaLibraryClient
      media={media.map((item) => ({
        id: item.id,
        url: item.url,
        filename: item.filename,
        folderId: item.folderId,
        mimeType: item.mimeType,
        size: item.size,
        width: item.width,
        height: item.height,
        altTh: item.altTh,
        altEn: item.altEn,
        captionTh: item.captionTh,
        captionEn: item.captionEn,
        createdAt: item.createdAt.toISOString(),
        usageCount: usage.get(item.id)?.length ?? 0,
        usedIn: usage.get(item.id) ?? [],
      }))}
      folders={folders.map((f) => ({ id: f.id, name: f.name, count: f._count.media }))}
      totalAll={totalAll}
      uncategorizedCount={uncategorizedCount}
      unusedCount={unusedCount}
      activeFolder={activeFolder}
      q={q ?? ""}
      page={page}
      totalPages={totalPages}
      canDelete={canDo(role, "media.delete")}
    />
  );
}
