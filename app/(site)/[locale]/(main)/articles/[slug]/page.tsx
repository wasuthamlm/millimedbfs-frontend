import { notFound, permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { decodeParam, postPath } from "@/lib/public-urls";
import { localePath } from "@/lib/i18n/locales";

// Old /articles/<slug> URLs → /news/<type>/<slug>.
export default async function ArticleRedirect({ params }: PageProps<"/[locale]/articles/[slug]">) {
  const { locale, slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug: decodeParam(slug) },
    select: { slug: true, kind: true, articleCategory: { select: { slug: true } } },
  });
  if (!post) notFound();
  permanentRedirect(localePath(locale, postPath(post)));
}
