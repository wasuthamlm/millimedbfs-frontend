import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { CookieConsentEditor } from "@/components/admin/site/CookieConsentEditor";
import { KeyIcon } from "@/components/ui/admin-icons";
import { getSiteConfig, SITE_CONFIG_KEYS } from "@/lib/site-config";
import { DEFAULT_COOKIE_CONFIG } from "@/lib/i18n/cookie-strings";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Cookie Consent" };
export const dynamic = "force-dynamic";

// Access: ADMIN + APPROVER (SECTION_ACCESS in lib/admin-roles.ts, enforced by proxy.ts).
export default async function CookieConsentAdminPage() {
  const [config, widget] = await Promise.all([
    getSiteConfig(SITE_CONFIG_KEYS.cookieConsent, DEFAULT_COOKIE_CONFIG),
    prisma.widget.findUnique({ where: { key: "cookie-consent" }, select: { enabled: true } }),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={KeyIcon}
        title="Cookie Consent"
        subtitle={`แก้ข้อความแบนเนอร์คุกกี้ทีละภาษาและลิงก์นโยบาย — เปิด/ปิดแบนเนอร์ได้ที่ จัดการ Widgets (ตอนนี้: ${widget?.enabled ? "เปิดอยู่" : "ปิดอยู่"})`}
      />
      <CookieConsentEditor initial={config} />
    </div>
  );
}
