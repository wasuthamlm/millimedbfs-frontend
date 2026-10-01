import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { ContactFormEditor } from "@/components/admin/site/ContactFormEditor";
import { MailIcon } from "@/components/ui/admin-icons";
import { getSiteConfig, SITE_CONFIG_KEYS } from "@/lib/site-config";
import { DEFAULT_CONTACT_CONFIG, isContactMarketingEligible, normalizeContactConfig, type ContactEligibility } from "@/lib/contact-config";

export const metadata: Metadata = { title: "จัดการฟอร์มติดต่อ" };
export const dynamic = "force-dynamic";

export default async function ContactFormAdminPage() {
  const [stored, eligibility] = await Promise.all([
    getSiteConfig(SITE_CONFIG_KEYS.contact, DEFAULT_CONTACT_CONFIG),
    getSiteConfig<ContactEligibility>(SITE_CONFIG_KEYS.contactMarketingEligible, { enabled: false, fingerprint: "" }),
  ]);
  const config = normalizeContactConfig(stored);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={MailIcon}
        title="จัดการฟอร์มติดต่อ"
        subtitle="เลือกรูปแบบหน้า ช่องที่ให้กรอก และเพิ่มช่องเอง — ที่อยู่/เบอร์/แผนที่ แก้ได้ที่ การตั้งค่า → ข้อมูลติดต่อ"
      />
      <ContactFormEditor initial={config} initialMarketingEligible={isContactMarketingEligible(eligibility, config)} />
    </div>
  );
}
