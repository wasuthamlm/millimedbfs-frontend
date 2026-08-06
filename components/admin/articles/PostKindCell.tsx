"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPostKind } from "@/app/admin/articles/actions";
import { StatusSelectPill } from "@/components/admin/StatusSelectPill";

const OPTIONS = [
  { value: "ARTICLE" as const, label: "บทความ" },
  { value: "NEWS" as const, label: "ข่าว" },
];

export function PostKindCell({ id, kind }: { id: string; kind: "ARTICLE" | "NEWS" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <StatusSelectPill
      value={kind}
      options={OPTIONS}
      colorClass="bg-slate-100 text-slate-600"
      disabled={pending}
      ariaLabel="ประเภทบทความ"
      onChange={(next) =>
        startTransition(async () => {
          await setPostKind(id, next);
          router.refresh();
        })
      }
    />
  );
}
