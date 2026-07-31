"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { XCircleIcon } from "@/components/ui/admin-icons";
import { cn } from "@/lib/utils";
import type { PageSection, DeviceVisibility } from "@/data/admin-pages";
import { SectionPreviewBody } from "./SectionPreviewBody";

type Device = keyof DeviceVisibility;

const deviceWidths: Record<Device, string> = {
  desktop: "max-w-full",
  tablet: "max-w-3xl",
  mobile: "max-w-sm",
};

const deviceLabels: Record<Device, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

export function PreviewModal({
  sections,
  onClose,
}: {
  sections: PageSection[];
  onClose: () => void;
}) {
  const [device, setDevice] = useState<Device>("desktop");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-8">
      <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="text-sm font-semibold text-slate-700">ดูตัวอย่างหน้าเว็บ</p>
          <div className="flex items-center gap-2">
            {(Object.keys(deviceLabels) as Device[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setDevice(key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  device === key
                    ? "bg-brand-navy text-white"
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {deviceLabels[key]}
              </button>
            ))}
            <button
              type="button"
              aria-label="ปิดตัวอย่าง"
              onClick={onClose}
              className="ml-2 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8">
          <div className={cn("mx-auto overflow-hidden rounded-xl bg-white shadow-lg transition-all", deviceWidths[device])}>
            <Navbar />
            {sections
              .filter((s) => s.visibility[device])
              .sort((a, b) => a.order - b.order)
              .map((s) => (
                <SectionPreviewBody key={s.id} section={s} />
              ))}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
