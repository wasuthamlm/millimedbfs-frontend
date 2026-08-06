"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPostStatus } from "@/app/admin/articles/actions";
import { StatusSelectPill } from "@/components/admin/StatusSelectPill";

const STYLES: Record<string, string> = {
  DRAFT: "bg-amber-50 text-amber-700",
  PUBLISHED: "bg-emerald-50 text-emerald-700",
};

const OPTIONS = [
  { value: "DRAFT" as const, label: "draft" },
  { value: "PUBLISHED" as const, label: "published" },
];

export function PostStatusCell({ id, status }: { id: string; status: "DRAFT" | "PUBLISHED" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <StatusSelectPill
      value={status}
      options={OPTIONS}
      colorClass={STYLES[status]}
      disabled={pending}
      ariaLabel="สถานะบทความ"
      onChange={(next) =>
        startTransition(async () => {
          await setPostStatus(id, next);
          router.refresh();
        })
      }
    />
  );
}
