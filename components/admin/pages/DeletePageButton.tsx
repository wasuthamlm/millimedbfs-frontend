"use client";

import { useRouter } from "next/navigation";
import { TrashIcon } from "@/components/ui/admin-icons";
import { deletePage } from "@/app/admin/pages/actions";

export function DeletePageButton({ id, titleTh }: { id: string; titleTh: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`ยืนยันการลบหน้า "${titleTh}"?`)) return;
    const result = await deletePage(id);
    if (result.error) {
      window.alert(result.error);
      return;
    }
    router.refresh();
  };

  return (
    <button
      type="button"
      aria-label={`ลบ ${titleTh}`}
      onClick={handleDelete}
      className="text-red-400 hover:text-red-600"
    >
      <TrashIcon className="h-4 w-4" />
    </button>
  );
}
