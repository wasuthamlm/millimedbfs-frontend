import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { MediaLibraryClient } from "@/components/admin/media/MediaLibraryClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

const UNUSED_FILTER: Prisma.MediaWhereInput = {
  posts: { none: {} },
  banners: { none: {} },
  products: { none: {} },
  popups: { none: {} },
};

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; q?: string; page?: string }>;
}) {
  const { folder, q, page: pageParam } = await searchParams;
  const activeFolder = folder ?? "all";
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.MediaWhereInput = {
    ...(q ? { filename: { contains: q, mode: "insensitive" } } : {}),
    ...(activeFolder === "uncategorized"
      ? { folderId: null }
      : activeFolder === "unused"
        ? UNUSED_FILTER
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
      include: {
        folder: true,
        _count: { select: { posts: true, banners: true, products: true, popups: true } },
      },
    }),
    prisma.media.count({ where }),
    prisma.mediaFolder.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { media: true } } },
    }),
    prisma.media.count(),
    prisma.media.count({ where: { folderId: null } }),
    prisma.media.count({ where: UNUSED_FILTER }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <MediaLibraryClient
      media={media.map((item) => ({
        id: item.id,
        url: item.url,
        filename: item.filename,
        folderId: item.folderId,
        usageCount: item._count.posts + item._count.banners + item._count.products + item._count.popups,
      }))}
      folders={folders.map((f) => ({ id: f.id, name: f.name, count: f._count.media }))}
      totalAll={totalAll}
      uncategorizedCount={uncategorizedCount}
      unusedCount={unusedCount}
      activeFolder={activeFolder}
      q={q ?? ""}
      page={page}
      totalPages={totalPages}
    />
  );
}
