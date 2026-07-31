"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@/components/ui/admin-icons";

export function SaveButton({
  label = "บันทึกการเปลี่ยนแปลง",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const [saved, setSaved] = useState(false);

  const handleClick = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-dark",
        className
      )}
    >
      {saved && <CheckIcon className="h-4 w-4" />}
      {saved ? "บันทึกแล้ว (ตัวอย่าง UI)" : label}
    </button>
  );
}
