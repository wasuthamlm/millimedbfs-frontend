import { PageHeader } from "@/components/admin/PageHeader";
import { PageForm } from "@/components/admin/pages/PageForm";
import { GlobeIcon } from "@/components/ui/admin-icons";

export default function NewPagePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={GlobeIcon} title="สร้างหน้าใหม่" />
      <PageForm />
    </div>
  );
}
