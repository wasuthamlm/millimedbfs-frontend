import { PageHeader } from "@/components/admin/PageHeader";
import { FileTextIcon } from "@/components/ui/admin-icons";

export default function NewArticlePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={FileTextIcon} title="เพิ่มบทความใหม่" />
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
        แบบฟอร์มเพิ่มบทความกำลังจะมาเร็ว ๆ นี้
      </div>
    </div>
  );
}
