import Link from "next/link";
import { cn } from "@/lib/utils";

export function Pager({
  page,
  totalPages,
  basePath,
  extraParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  extraParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(extraParams ?? {})) {
      if (value) params.set(key, value);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const linkClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50";
  const disabledClass =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-100 px-3 text-sm font-medium text-slate-300";

  return (
    <div className="flex items-center justify-between gap-4 px-1">
      <p className="text-sm text-slate-500">
        หน้า {page} จาก {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={linkClass}>
            ก่อนหน้า
          </Link>
        ) : (
          <span className={disabledClass}>ก่อนหน้า</span>
        )}
        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} className={cn(linkClass)}>
            ถัดไป
          </Link>
        ) : (
          <span className={disabledClass}>ถัดไป</span>
        )}
      </div>
    </div>
  );
}
