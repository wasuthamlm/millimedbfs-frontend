import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { PageHeroEditor } from "@/components/admin/site/PageHeroEditor";
import { GlobeIcon } from "@/components/ui/admin-icons";
import { getSiteConfig, SITE_CONFIG_KEYS } from "@/lib/site-config";
import { HERO_DEFAULTS } from "@/lib/page-hero";

export const metadata: Metadata = { title: "จัดการหัวข้อหน้า" };
export const dynamic = "force-dynamic";

export default async function PageHeroAdminPage() {
  const config = await getSiteConfig(SITE_CONFIG_KEYS.pageHero, HERO_DEFAULTS);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={GlobeIcon}
        title="จัดการหัวข้อหน้า (Page Hero)"
        subtitle="แถบหัวข้อด้านบนของทุกหน้า (ยกเว้นหน้าแรก) — ซ่อนหรือจัดตำแหน่งเฉพาะหน้าได้ในแท็บ SEO ของ Page Builder"
      />
      <PageHeroEditor initial={config} />
    </div>
  );
}
