import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { GlobeIcon } from "@/components/ui/admin-icons";
import { adminPages, pageSectionsBySlug } from "@/data/admin-pages";
import { PageEditor } from "@/components/admin/pages/PageEditor";

export function generateStaticParams() {
  return adminPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = adminPages.find((p) => p.slug === slug);
  return { title: page ? `แก้ไข: ${page.titleTh}` : "ไม่พบหน้า" };
}

export default async function PageEditorRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = adminPages.find((p) => p.slug === slug);
  if (!page) notFound();

  const sections = pageSectionsBySlug[slug] ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          icon={GlobeIcon}
          title={page.titleTh}
          subtitle={`/${page.slug} · ${page.titleEn}`}
        />
        <div className="flex items-center gap-3">
          <StatusBadge status={page.status} />
          <Link
            href="/admin/pages"
            className="text-sm font-medium text-brand-navy hover:text-brand-gold-dark"
          >
            ← กลับไป Page Manager
          </Link>
        </div>
      </div>

      <PageEditor page={page} initialSections={sections} />
    </div>
  );
}
