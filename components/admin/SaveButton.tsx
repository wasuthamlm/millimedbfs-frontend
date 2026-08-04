"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@/components/ui/admin-icons";

export function SaveButton({
  label = "บันทึกการเปลี่ยนแปลง",
  className,
  onSave,
}: {
  label?: string;
  className?: string;
  onSave?: () => Promise<void>;
}) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const handleClick = async () => {
    if (!onSave) {
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 2000);
      return;
    }

    setStatus("saving");
    try {
      await onSave();
      setStatus("saved");
    } catch {
      setStatus("error");
    }
    window.setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "saving"}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-navy-dark disabled:opacity-60",
        status === "error" && "bg-red-600 hover:bg-red-600",
        className
      )}
    >
      {status === "saved" && <CheckIcon className="h-4 w-4" />}
      {status === "saving" && "กำลังบันทึก..."}
      {status === "saved" && (onSave ? "บันทึกแล้ว" : "บันทึกแล้ว (ตัวอย่าง UI)")}
      {status === "error" && "บันทึกไม่สำเร็จ"}
      {status === "idle" && label}
    </button>
  );
}
