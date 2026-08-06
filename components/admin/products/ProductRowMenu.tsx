"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PencilIcon, TrashIcon } from "@/components/ui/admin-icons";
import { deleteProduct } from "@/app/admin/products/actions";

export function ProductRowMenu({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const remove = () => {
    if (!confirm("ยืนยันการลบสินค้านี้?")) return;
    startTransition(async () => {
      await deleteProduct(id);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/products/${id}/edit`}
        aria-label="แก้ไข"
        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-navy"
      >
        <PencilIcon className="h-4 w-4" />
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={remove}
        aria-label="ลบ"
        className="rounded-md p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-60"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
