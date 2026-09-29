"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { TrashIcon } from "@/components/ui/admin-icons";

/** "Active / Trash (n)" toggle plus an Empty-trash button (legacy EmptyTrashButton). */
export function TrashToolbar({
  basePath,
  inTrash,
  trashCount,
  canDelete,
  onEmpty,
}: {
  basePath: string;
  inTrash: boolean;
  trashCount: number;
  canDelete: boolean;
  onEmpty: () => Promise<{ error?: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const tab = (active: boolean) =>
    cn("rounded-full px-4 py-1.5 text-sm font-medium", active ? "bg-brand-navy text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={basePath} className={tab(!inTrash)}>
        รายการ
      </Link>
      <Link href={`${basePath}?trash=1`} className={cn(tab(inTrash), "inline-flex items-center gap-1.5")}>
        <TrashIcon className="h-3.5 w-3.5" />
        ถังขยะ ({trashCount})
      </Link>
      {inTrash && canDelete && trashCount > 0 && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(`ลบถาวรทั้งหมด ${trashCount} รายการในถังขยะ? การลบถาวรไม่สามารถกู้คืนได้`)) return;
            startTransition(async () => {
              await onEmpty();
              router.refresh();
            });
          }}
          className="ml-auto rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {pending ? "กำลังล้าง..." : "ล้างถังขยะ"}
        </button>
      )}
    </div>
  );
}
