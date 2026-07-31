import { PageHeader } from "@/components/admin/PageHeader";
import { BoxIcon } from "@/components/ui/admin-icons";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={BoxIcon} title="เพิ่มสินค้าใหม่" />
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
        แบบฟอร์มเพิ่มสินค้ากำลังจะมาเร็ว ๆ นี้
      </div>
    </div>
  );
}
