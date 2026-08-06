"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setProductStatus } from "@/app/admin/products/actions";
import { StatusSelectPill } from "@/components/admin/StatusSelectPill";

const STYLES: Record<string, string> = {
  DRAFT: "bg-amber-50 text-amber-700",
  ACTIVE: "bg-emerald-50 text-emerald-700",
  ARCHIVED: "bg-slate-100 text-slate-500",
};

const OPTIONS = [
  { value: "DRAFT" as const, label: "draft" },
  { value: "ACTIVE" as const, label: "active" },
  { value: "ARCHIVED" as const, label: "archived" },
];

export function ProductStatusCell({
  id,
  status,
}: {
  id: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <StatusSelectPill
      value={status}
      options={OPTIONS}
      colorClass={STYLES[status]}
      disabled={pending}
      ariaLabel="สถานะสินค้า"
      onChange={(next) =>
        startTransition(async () => {
          await setProductStatus(id, next);
          router.refresh();
        })
      }
    />
  );
}
