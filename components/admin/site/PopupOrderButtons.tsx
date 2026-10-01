"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownIcon, ArrowUpIcon } from "@/components/ui/admin-icons";
import { reorderPopups } from "@/app/admin/site/popup/actions";

/** Up/down buttons that move one popup within the ordered id list. */
export function PopupOrderButtons({ ids, index }: { ids: string[]; index: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const move = (dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    const next = [...ids];
    [next[index], next[j]] = [next[j], next[index]];
    startTransition(async () => {
      await reorderPopups(next);
      router.refresh();
    });
  };
  return (
    <div className="flex gap-1">
      <button type="button" disabled={pending || index === 0} onClick={() => move(-1)} aria-label="เลื่อนขึ้น" className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30">
        <ArrowUpIcon className="h-4 w-4" />
      </button>
      <button type="button" disabled={pending || index === ids.length - 1} onClick={() => move(1)} aria-label="เลื่อนลง" className="rounded p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-30">
        <ArrowDownIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
