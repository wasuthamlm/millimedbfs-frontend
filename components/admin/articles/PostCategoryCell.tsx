"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "@/components/ui/icons";
import { setPostCategory } from "@/app/admin/articles/actions";

export function PostCategoryCell({
  id,
  categoryId,
  categories,
}: {
  id: string;
  categoryId: string | null;
  categories: { id: string; nameTh: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative inline-flex">
      <select
        value={categoryId ?? ""}
        disabled={pending}
        aria-label="หมวดหมู่บทความ"
        onChange={(e) =>
          startTransition(async () => {
            await setPostCategory(id, e.target.value);
            router.refresh();
          })
        }
        className="cursor-pointer appearance-none rounded-full border-0 bg-slate-100 py-0.5 pl-2.5 pr-6 text-xs font-medium text-slate-600 outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">— ไม่ระบุ —</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nameTh}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-70" />
    </div>
  );
}
