import { PageHeroView } from "@/components/site/PageHeroView";
import { getSiteConfig, SITE_CONFIG_KEYS } from "@/lib/site-config";
import { HERO_DEFAULTS } from "@/lib/page-hero";

/** Page header band for public pages, styled by the global config (Admin → จัดการหัวข้อหน้า). */
export async function PageHero({
  title,
  subtitle,
  page,
}: {
  title: string;
  subtitle?: string | null;
  page?: { heroStyle: string | null; heroAlignment: string | null } | null;
}) {
  const config = await getSiteConfig(SITE_CONFIG_KEYS.pageHero, HERO_DEFAULTS);
  return <PageHeroView config={config} title={title} subtitle={subtitle} align={page?.heroAlignment} hidden={page?.heroStyle === "none"} />;
}
