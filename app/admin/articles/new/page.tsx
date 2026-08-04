import { PageHeader } from "@/components/admin/PageHeader";
import { PostForm } from "@/components/admin/articles/PostForm";
import { FileTextIcon } from "@/components/ui/admin-icons";

export default function NewArticlePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={FileTextIcon} title="เพิ่มบทความใหม่" />
      <PostForm />
    </div>
  );
}
