"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PencilIcon, RotateCcwIcon, TrashIcon } from "@/components/ui/admin-icons";

type IdsAction = (ids: string[]) => Promise<{ error?: string } | void>;

/** Row actions for soft-deletable entities: edit + move to trash, or restore + purge when viewing the trash. */
export function TrashRowMenu({
  id,
  editHref,
  inTrash,
  canDelete,
  onTrash,
  onRestore,
  onPurge,
  noun = "รายการ",
}: {
  id: string;
  editHref?: string;
  inTrash: boolean;
  canDelete: boolean;
  onTrash: IdsAction;
  onRestore: IdsAction;
  onPurge: IdsAction;
  noun?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const run = (fn: IdsAction, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(async () => {
      await fn([id]);
      router.refresh();
    });
  };
  const btn = "rounded-md p-1.5 disabled:opacity-50";

  return (
    <div className="flex items-center justify-end gap-1">
      {inTrash ? (
        canDelete && (
          <>
            <button type="button" disabled={pending} onClick={() => run(onRestore)} title="กู้คืน" aria-label="กู้คืน" className={`${btn} text-emerald-600 hover:bg-emerald-50`}>
              <RotateCcwIcon className="h-4 w-4" />
            </button>
            <button type="button" disabled={pending} onClick={() => run(onPurge, `ลบ${noun}นี้ถาวร? ไม่สามารถกู้คืนได้`)} title="ลบถาวร" aria-label="ลบถาวร" className={`${btn} text-red-500 hover:bg-red-50`}>
              <TrashIcon className="h-4 w-4" />
            </button>
          </>
        )
      ) : (
        <>
          {editHref && (
            <Link href={editHref} aria-label="แก้ไข" className={`${btn} text-slate-500 hover:bg-slate-100 hover:text-brand-navy`}>
              <PencilIcon className="h-4 w-4" />
            </Link>
          )}
          {canDelete && (
            <button type="button" disabled={pending} onClick={() => run(onTrash, `ย้าย${noun}นี้ไปถังขยะ?`)} aria-label="ย้ายไปถังขยะ" className={`${btn} text-red-500 hover:bg-red-50`}>
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
