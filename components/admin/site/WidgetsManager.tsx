"use client";

import { useState } from "react";
import { Toggle } from "@/components/admin/Toggle";
import { SaveButton } from "@/components/admin/SaveButton";
import type { Widget } from "@/data/admin-widgets";
import { saveWidgets } from "@/app/admin/site/widgets/actions";

const LINK_KEYS = new Set(["line-official-account", "facebook-messenger"]);

export function WidgetsManager({ initialWidgets }: { initialWidgets: Widget[] }) {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);

  const toggle = (id: string, enabled: boolean) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, enabled } : w)));
  };

  const updateLink = (id: string, link: string) => {
    setWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, link } : w)));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col divide-y divide-slate-50 rounded-2xl border border-slate-100 bg-white shadow-sm">
        {widgets.map((widget) => (
          <div key={widget.id} className="flex flex-col gap-3 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">{widget.name}</p>
                <p className="text-xs text-slate-400">{widget.description}</p>
              </div>
              <Toggle
                checked={widget.enabled}
                onChange={(v) => toggle(widget.id, v)}
                label={`เปิดใช้งาน ${widget.name}`}
              />
            </div>
            {LINK_KEYS.has(widget.key) && (
              <input
                type="url"
                placeholder="วางลิงก์ เช่น https://line.me/R/ti/p/..."
                value={widget.link ?? ""}
                onChange={(e) => updateLink(widget.id, e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <SaveButton onSave={() => saveWidgets(widgets)} />
      </div>
    </div>
  );
}
