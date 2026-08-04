import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { Share2Icon } from "@/components/ui/admin-icons";
import { PopupManager } from "@/components/admin/site/PopupManager";
import { prisma } from "@/lib/prisma";
import type { PopupConfig } from "@/data/admin-popup";

export const metadata: Metadata = { title: "จัดการ Popup" };
export const dynamic = "force-dynamic";

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default async function AdminPopupPage() {
  const row = await prisma.popupConfig.findUnique({
    where: { id: "singleton" },
    include: { image: true },
  });

  const initialConfig: PopupConfig = {
    enabled: row?.enabled ?? false,
    titleTh: row?.titleTh ?? "",
    image: row?.image?.url ?? "/images/news/otc-symposium-2022.svg",
    link: row?.link ?? "/",
    frequency: (row?.frequency as PopupConfig["frequency"]) ?? "once-per-day",
    startDate: toDateInputValue(row?.startDate),
    endDate: toDateInputValue(row?.endDate),
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={Share2Icon} title="จัดการ Popup" subtitle="ตั้งค่า Popup ประชาสัมพันธ์ที่แสดงบนหน้าเว็บสาธารณะ" />
      <PopupManager initialConfig={initialConfig} />
    </div>
  );
}
