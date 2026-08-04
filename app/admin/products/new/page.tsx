import { PageHeader } from "@/components/admin/PageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { BoxIcon } from "@/components/ui/admin-icons";

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={BoxIcon} title="เพิ่มสินค้าใหม่" />
      <ProductForm />
    </div>
  );
}
