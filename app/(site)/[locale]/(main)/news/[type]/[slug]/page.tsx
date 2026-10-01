import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { PRODUCT_CARD_SELECT, ProductGrid } from "@/components/products/ProductGrid";
import { prisma } from "@/lib/prisma";
import { POST_CARD_INCLUDE, toArticleView } from "@/lib/post-view";
import { sanitizeHtml } from "@/lib/sanitize";
import { buildBreadcrumbJsonLd, buildOpenGraph, SITE_URL } from "@/lib/site";
import { decodeParam, postPath, postTypeSlug } from "@/lib/public-urls";
import { localeInfo, localePath } from "@/lib/i18n/locales";
import { loadLocalizer } from "@/lib/i18n/localize";
import { localeAlternates } from "@/lib/i18n/alternates";
import { formatDate, ui } from "@/lib/i18n/ui";
import { TrackViewContent } from "@/components/analytics/PageTracking";

export const dynamic = "force-dynamic";

type Props = PageProps<"/[locale]/news/[type]/[slug]">;

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { ...POST_CARD_INCLUDE, articleCategory: { select: { id: true, slug: true, nameTh: true, nameEn: true } } },
  });
  if (!post || post.status !== "PUBLISHED" || post.deletedAt) return null;
  return post;
}

type LoadedPost = NonNullable<Awaited<ReturnType<typeof getPost>>>;

async function localizerFor(locale: string, post: LoadedPost, extraPostIds: string[] = []) {
  return loadLocalizer(locale, [
    ["ARTICLE", [post.id, ...extraPostIds]],
    ["ARTICLE_CATEGORY", [post.articleCategory?.id]],
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug: rawSlug } = await params;
  const post = await getPost(decodeParam(rawSlug));
  if (!post) return {};
  const t = await localizerFor(locale, post);
  const view = toArticleView(post, t);
  const title = t("ARTICLE", post.id, "seoTitle", post.seoTitle, post.seoTitleEn) || view.title;
  const description =
    t("ARTICLE", post.id, "seoDesc", post.seoDesc, post.seoDescEn) || t("ARTICLE", post.id, "excerpt", post.excerptTh, post.excerptEn) || undefined;
  return {
    title,
    description,
    alternates: await localeAlternates(locale, postPath(post), post.canonicalUrl),
    openGraph: buildOpenGraph({
      type: "article",
      locale: localeInfo(locale).ogLocale,
      title: t("ARTICLE", post.id, "ogTitle", post.ogTitle, post.ogTitleEn) || title,
      description: t("ARTICLE", post.id, "ogDesc", post.ogDesc, post.ogDescEn) || description,
      images: [post.ogImageUrl || view.image],
    }),
    ...(post.seoNoIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { locale, type, slug: rawSlug } = await params;
  const post = await getPost(decodeParam(rawSlug));
  if (!post) notFound();

  // One canonical URL per post: a wrong/legacy type segment redirects.
  if (decodeParam(type) !== postTypeSlug(post)) {
    permanentRedirect(localePath(locale, postPath(post)));
  }

  // Picked related posts, else the 3 latest of the same type (legacy behaviour).
  const [relatedPosts, relatedProducts] = await Promise.all([
    post.relatedPostIds.length
      ? prisma.post.findMany({ where: { id: { in: post.relatedPostIds }, status: "PUBLISHED", deletedAt: null }, include: POST_CARD_INCLUDE })
      : prisma.post.findMany({
          where: { status: "PUBLISHED", deletedAt: null, id: { not: post.id }, categoryId: post.categoryId },
          orderBy: { publishedAt: "desc" },
          take: 3,
          include: POST_CARD_INCLUDE,
        }),
    post.relatedProductIds.length
      ? prisma.product.findMany({ where: { id: { in: post.relatedProductIds }, status: "ACTIVE", deletedAt: null }, select: PRODUCT_CARD_SELECT })
      : Promise.resolve([]),
  ]);

  const t = await localizerFor(locale, post, relatedPosts.map((p) => p.id));
  const view = toArticleView(post, t);
  const path = localePath(locale, postPath(post));
  const absoluteImage = view.image.startsWith("http") ? view.image : `${SITE_URL}${view.image}`;
  const typePath = localePath(locale, `/news/${encodeURIComponent(postTypeSlug(post))}`);
  const typeName = post.articleCategory
    ? t("ARTICLE_CATEGORY", post.articleCategory.id, "name", post.articleCategory.nameTh, post.articleCategory.nameEn)
    : null;
  const excerpt = t("ARTICLE", post.id, "excerpt", post.excerptTh, post.excerptEn);
  const body = t("ARTICLE", post.id, "body", post.bodyTh, post.bodyEn);

  const en = locale === "en";
  const faq = (Array.isArray(post.faq) ? post.faq : [])
    .map((f) => f as { qTh?: string; aTh?: string; qEn?: string; aEn?: string })
    .map((f) => ({ q: (en && f.qEn) || f.qTh, a: (en && f.aEn) || f.aTh }))
    .filter((f) => f.q && f.a);
  const schemaExtra =
    post.schemaArticle && typeof post.schemaArticle === "object" && !Array.isArray(post.schemaArticle)
      ? (post.schemaArticle as Record<string, unknown>)
      : {};

  const articleJsonLd = {
    ...schemaExtra,
    "@context": "https://schema.org",
    "@type": post.kind === "NEWS" ? "NewsArticle" : "Article",
    headline: view.title,
    inLanguage: localeInfo(locale).hreflang,
    image: [absoluteImage],
    datePublished: view.publishedAt,
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "Millimed BFS" },
    mainEntityOfPage: `${SITE_URL}${path}`,
    ...(post.focusKeyword || post.secondaryKeywords.length
      ? { keywords: [post.focusKeyword, ...post.secondaryKeywords].filter(Boolean).join(", ") }
      : {}),
  };

  const faqJsonLd = faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }
    : null;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: ui(locale, "home"), path: localePath(locale, "/") },
    { name: ui(locale, "newsAndArticles"), path: localePath(locale, "/news") },
    ...(typeName ? [{ name: typeName, path: typePath }] : []),
    { name: view.title, path },
  ]);
  const ld = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

  return (
    <Container className="flex flex-col gap-6 py-14 sm:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(articleJsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ld(breadcrumbJsonLd)} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={ld(faqJsonLd)} />}
      <TrackViewContent contentKey={`post.${post.id}`} marketingEligible={post.marketingEligible} />
      <Link href={typePath} className="inline-flex w-fit items-center gap-1 text-sm font-medium text-brand-navy hover:text-brand-gold-dark">
        {ui(locale, "back")}
      </Link>
      <div className="relative aspect-[16/9] w-full max-w-3xl overflow-hidden rounded-2xl">
        <Image src={view.image} alt={view.title} fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" priority />
      </div>
      {typeName && <span className="w-fit rounded-full bg-brand-navy/10 px-3 py-1 text-xs font-medium text-brand-navy">{typeName}</span>}
      <p className="text-sm text-slate-400">{formatDate(locale, view.publishedAt)}</p>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{view.title}</h1>
      {post.kind === "NEWS" && excerpt && <p className="text-base leading-relaxed text-slate-600">{excerpt}</p>}
      {body && (
        <div
          className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-brand-navy"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(body) }}
        />
      )}
      {relatedProducts.length > 0 && (
        <section className="mt-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-900">{ui(locale, "relatedProducts")}</h2>
          <ProductGrid products={relatedProducts} locale={locale} />
        </section>
      )}
      {faq.length > 0 && (
        <section className="mt-6 flex flex-col gap-3">
          <h2 className="text-xl font-bold text-slate-900">{ui(locale, "faq")}</h2>
          {faq.map((f, i) => (
            <details key={i} className="group rounded-xl border border-slate-200 bg-white p-4 open:shadow-sm">
              <summary className="cursor-pointer list-none font-semibold text-slate-800 marker:hidden">{f.q}</summary>
              <p className="mt-2 whitespace-pre-line text-slate-600">{f.a}</p>
            </details>
          ))}
        </section>
      )}
      {relatedPosts.length > 0 && (
        <section className="mt-6 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-900">{ui(locale, "relatedArticles")}</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {relatedPosts.map((p) => {
              const v = toArticleView(p, t);
              return <ArticleCard key={p.id} article={{ ...v, href: localePath(locale, v.href) }} />;
            })}
          </div>
        </section>
      )}
    </Container>
  );
}
