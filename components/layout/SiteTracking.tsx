import Script from "next/script";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { TrackingManager } from "@/components/analytics/TrackingManager";
import { sanitizeGa4Id, sanitizeGtmId } from "@/lib/tracking-ids";
import { resolveCookieStrings, type CookieConsentConfig } from "@/lib/i18n/cookie-strings";

type TrackingSettings = {
  gtmId: string | null;
  ga4Id: string | null;
  fbPixelId: string | null;
  tiktokPixelId: string | null;
} | null;

/**
 * Consent-mode defaults + GTM/GA4/Meta/TikTok tags. Shared by the main site layout
 * and standalone landing pages so both track the same way.
 */
export function SiteTracking({ siteSettings, consentEnabled }: { siteSettings: TrackingSettings; consentEnabled: boolean }) {
  const cookieConsentEnabled = consentEnabled;
  const gtmId = sanitizeGtmId(siteSettings?.gtmId);
  const ga4Id = sanitizeGa4Id(siteSettings?.ga4Id);
  return (
    <>
      {cookieConsentEnabled && (
        // Google Consent Mode v2 — everything optional starts denied, before GTM/gtag
        // parse any tags. Ported from the legacy site's index.html. A plain inline
        // <script> (like the JSON-LD block above) rather than next/script: next/script's
        // beforeInteractive strategy is only hoisted into <head> server-side when
        // declared in the app-level ROOT layout — here, in the nested (site) layout, it
        // gets client-injected like any other strategy, arriving too late. A literal
        // <script> tag has no such caveat: it's part of the server HTML and runs
        // synchronously in document order, ahead of the afterInteractive GTM/GA4
        // <Script> tags right below it. gtag.js and GTM both read this signal on their
        // own once they load, so those scripts stay unconditional — only Meta/TikTok
        // (which have no built-in consent awareness) are gated to not load at all, via
        // TrackingManager further down.
        <script
          id="consent-default"
          dangerouslySetInnerHTML={{
            __html:
              "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});",
          }}
        />
      )}
      {gtmId && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}
      {ga4Id && !gtmId && (
        // Direct gtag only when there's no GTM container. With GTM, the container owns the
        // GA4 tag (legacy setup) and TrackingManager hands it the measurement id through
        // the dataLayer — loading gtag as well would count every page view twice.
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`}
          </Script>
        </>
      )}
      {/* Consent + marketing-eligibility gated pixels, virtual page views, lead/LINE events. */}
      <TrackingManager
        ga4Id={gtmId ? ga4Id : null}
        fbPixelId={siteSettings?.fbPixelId}
        tiktokPixelId={siteSettings?.tiktokPixelId}
        consentBanner={cookieConsentEnabled}
      />
    </>
  );
}

export function SiteCookieConsent({ locale, config }: { locale: string; config: CookieConsentConfig }) {
  return <CookieConsent strings={resolveCookieStrings(locale, config)} policyLinks={config.policyLinks} lang={locale} />;
}
