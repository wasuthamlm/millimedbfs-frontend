"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { StarIcon, BoltIcon } from "@/components/ui/admin-icons";
import { toggleProductFeatured, toggleProductBestSeller } from "@/app/admin/products/actions";
import { cn } from "@/lib/utils";

export function ProductFlagsCell({
  id,
  featured,
  bestSeller,
}: {
  id: string;
  featured: boolean;
  bestSeller: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        aria-label="สินค้าแนะนำ"
        title="สินค้าแนะนำ (Featured)"
        onClick={() =>
          startTransition(async () => {
            await toggleProductFeatured(id, !featured);
            router.refresh();
          })
        }
        className={cn(
          "rounded-md p-1 transition-colors disabled:opacity-60",
          featured ? "text-amber-500" : "text-slate-300 hover:text-amber-400"
        )}
      >
        <StarIcon className="h-4 w-4" filled={featured} />
      </button>
      <button
        type="button"
        disabled={pending}
        aria-label="สินค้าขายดี"
        title="ขายดี (Best Seller)"
        onClick={() =>
          startTransition(async () => {
            await toggleProductBestSeller(id, !bestSeller);
            router.refresh();
          })
        }
        className={cn(
          "rounded-md p-1 transition-colors disabled:opacity-60",
          bestSeller ? "text-brand-navy" : "text-slate-300 hover:text-brand-navy"
        )}
      >
        <BoltIcon className="h-4 w-4" filled={bestSeller} />
      </button>
    </div>
  );
}
