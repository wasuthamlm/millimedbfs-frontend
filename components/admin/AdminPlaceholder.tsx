import type { ComponentType } from "react";
import { PageHeader } from "./PageHeader";

export function AdminPlaceholder({
  icon,
  title,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon={icon} title={title} />
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center text-sm text-slate-400">
        ฟีเจอร์นี้กำลังอยู่ระหว่างการพัฒนา
      </div>
    </div>
  );
}
