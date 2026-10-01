import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { PopupForm } from "@/components/admin/site/PopupForm";
import { Share2Icon } from "@/components/ui/admin-icons";
import { prisma } from "@/lib/prisma";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";
import { toBangkokInput } from "@/lib/utils";
import type { PopupInput } from "@/app/admin/site/popup/actions";

export const metadata: Metadata = { title: "แก้ไข Popup" };
export const dynamic = "force-dynamic";

export default async function EditPopupPage({ params }: PageProps<"/admin/site/popup/[id]">) {
  const { id } = await params;
  const [p, role] = await Promise.all([prisma.popup.findUnique({ where: { id } }), getAdminRole()]);
  if (!p) notFound();
  const initial: PopupInput = {
    titleTh: p.titleTh ?? "",
    titleEn: p.titleEn ?? "",
    bodyTh: p.bodyTh ?? "",
    bodyEn: p.bodyEn ?? "",
    imageUrl: p.imageUrl ?? "",
    buttonLabelTh: p.buttonLabelTh ?? "",
    buttonLabelEn: p.buttonLabelEn ?? "",
    link: p.link ?? "",
    openInNewTab: p.openInNewTab,
    layout: p.layout as PopupInput["layout"],
    animation: p.animation as PopupInput["animation"],
    size: p.size as PopupInput["size"],
    delaySeconds: p.delaySeconds,
    frequency: p.frequency as PopupInput["frequency"],
    homeOnly: p.homeOnly,
    status: p.status,
    active: p.active,
    startDate: toBangkokInput(p.startDate).slice(0, 10),
    endDate: toBangkokInput(p.endDate).slice(0, 10),
  };
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={Share2Icon} title={`แก้ไข Popup: ${p.titleTh || "(ไม่มีหัวข้อ)"}`} subtitle={p.deletedAt ? "Popup นี้อยู่ในถังขยะ" : undefined} />
      <PopupForm id={p.id} initial={initial} canPublish={canDo(role, "popup.publish")} />
    </div>
  );
}
