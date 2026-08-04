import { PageHeader } from "@/components/admin/PageHeader";
import { ChangePasswordForm } from "@/components/admin/settings/ChangePasswordForm";
import { SettingsIcon } from "@/components/ui/admin-icons";

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={SettingsIcon} title="การตั้งค่า" />
      <ChangePasswordForm />
    </div>
  );
}
