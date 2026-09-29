"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PencilIcon, RotateCcwIcon, TrashIcon } from "@/components/ui/admin-icons";
import { purgePosts, restorePosts, trashPosts } from "@/app/admin/articles/actions";

export function PostRowMenu({ id, inTrash, canDelete }: { id: string; inTrash: boolean; canDelete: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<unknown>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  };

  if (inTrash) {
    if (!canDelete) return null;
    return (
      <div className="flex items-center justify-end gap-1">
        <button type="button" disabled={pending} onClick={() => run(() => restorePosts([id]))} aria-label="กู้คืน" title="กู้คืน" className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50">
          <RotateCcwIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => purgePosts([id]), "ลบบทความนี้ถาวร? ไม่สามารถกู้คืนได้")}
          aria-label="ลบถาวร"
          title="ลบถาวร"
          className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/admin/articles/${id}/edit`} aria-label="แก้ไข" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-navy">
        <PencilIcon className="h-4 w-4" />
      </Link>
      {canDelete && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => trashPosts([id]), "ย้ายบทความนี้ไปถังขยะ?")}
          aria-label="ย้ายไปถังขยะ"
          className="rounded-md p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-60"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
