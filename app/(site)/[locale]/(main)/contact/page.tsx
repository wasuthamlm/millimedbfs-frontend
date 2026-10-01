import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { PageHero } from "@/components/site/PageHero";
import { SectionsWithData } from "@/components/site/SectionsWithData";
import { cmsPageMetadata } from "@/components/site/CmsPageOrPlaceholder";
import { loadLocalizer } from "@/lib/i18n/localize";
import { ui } from "@/lib/i18n/ui";
import { ContactInfoBlock } from "@/components/site/sections/blocks";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { getSiteConfig, SITE_CONFIG_KEYS } from "@/lib/site-config";
import { DEFAULT_CONTACT_CONFIG, isContactMarketingEligible, normalizeContactConfig, type ContactEligibility } from "@/lib/contact-config";
import { MarketingEligibility } from "@/components/analytics/PageTracking";
import { mapEmbedSrc } from "@/lib/map-embed";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata(locale, "contact", { title: ui(locale, "contactUs"), description: ui(locale, "contactDesc") });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const lang = locale === "en" ? "en" : "th";
  const [contact, settings, stored, eligibility, cmsPage] = await Promise.all([
    prisma.footerContact.findUnique({ where: { id: "singleton" } }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" }, select: { lineUrl: true, facebookUrl: true } }),
    getSiteConfig(SITE_CONFIG_KEYS.contact, DEFAULT_CONTACT_CONFIG),
    getSiteConfig<ContactEligibility>(SITE_CONFIG_KEYS.contactMarketingEligible, { enabled: false, fingerprint: "" }),
    // Blocks added to the "contact" page in the page builder render below the form.
    prisma.page.findFirst({
      where: { slug: "contact", status: "PUBLISHED", archived: false, deletedAt: null },
      include: { sections: { orderBy: { order: "asc" } } },
    }),
  ]);
  const config = normalizeContactConfig(stored);
  const tPage = cmsPage ? await loadLocalizer(locale, [["PAGE", [cmsPage.id]]]) : null;

  const info = (
    <div className="flex h-fit flex-col gap-4 rounded-2xl border border-slate-100 bg-site-bg p-6">
      <ContactInfoBlock
        locale={locale}
        info={{
          companyName: lang === "en" ? contact?.companyNameEn || contact?.companyNameTh : contact?.companyNameTh,
          address: lang === "en" ? contact?.addressEn || contact?.address : contact?.address,
          phone: contact?.phone,
          email: contact?.email,
          lineId: contact?.lineId,
          taxId: contact?.taxId,
        }}
      />
      {(settings?.lineUrl || settings?.facebookUrl) && (
        <div className="flex flex-wrap gap-2">
          {settings.lineUrl && (
            <a href={settings.lineUrl} target="_blank" rel="noopener noreferrer" data-line-click="contact" className="rounded-full bg-[#06C755] px-4 py-2 text-sm font-semibold text-white">
              LINE
            </a>
          )}
          {settings.facebookUrl && (
            <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white">
              Facebook
            </a>
          )}
        </div>
      )}
    </div>
  );
  const map = config.showMap ? mapEmbedSrc(contact?.googleMapsEmbedUrl) : null;

  return (
    <>
      <MarketingEligibility kind="record" eligible={isContactMarketingEligible(eligibility, config)} />
      <PageHero
        title={cmsPage && tPage ? tPage("PAGE", cmsPage.id, "title", cmsPage.titleTh, cmsPage.titleEn) : ui(locale, "contactUs")}
        page={cmsPage}
      />
      <Container className="flex flex-col gap-10 py-10 sm:py-14">
        <div className={cn("grid gap-10", config.layout !== "stacked" && "lg:grid-cols-3")}>
          {config.layout === "info-left" && info}
          <div className={cn(config.layout !== "stacked" && "lg:col-span-2")}>
            <ContactForm config={config} locale={locale} />
          </div>
          {config.layout !== "info-left" && info}
        </div>
        {map && (
          <iframe src={map} title={ui(locale, "map")} className="h-80 w-full rounded-2xl border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        )}
      </Container>
      {cmsPage && cmsPage.sections.length > 0 && (
        <SectionsWithData locale={locale} sections={cmsPage.sections} />
      )}
    </>
  );
}
