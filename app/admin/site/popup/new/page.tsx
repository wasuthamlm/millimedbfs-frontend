import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { PopupForm, EMPTY_POPUP } from "@/components/admin/site/PopupForm";
import { Share2Icon } from "@/components/ui/admin-icons";
import { canDo } from "@/lib/admin-roles";
import { getAdminRole } from "@/lib/require-admin";

export const metadata: Metadata = { title: "เพิ่ม Popup" };

export default async function NewPopupPage() {
  const role = await getAdminRole();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={Share2Icon} title="เพิ่ม Popup" />
      <PopupForm initial={EMPTY_POPUP} canPublish={canDo(role, "popup.publish")} />
    </div>
  );
}
