"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { SaveButton } from "@/components/admin/SaveButton";
import { Select } from "@/components/admin/Select";
import { saveAiSettings } from "@/app/admin/settings/actions";
import type { AiProvider } from "@/lib/generated/prisma/client";

export type AiSettingsData = { provider: AiProvider; model: string };

const PROVIDERS: { value: AiProvider; label: string; description: string }[] = [
  { value: "GEMINI", label: "Google Gemini", description: "gemini-flash-latest, gemini-1.5-pro ฯลฯ" },
  { value: "OPENAI", label: "OpenAI (GPT)", description: "gpt-4o, gpt-4o-mini, gpt-4-turbo ฯลฯ" },
];

const MODEL_OPTIONS: Record<AiProvider, { value: string; label: string }[]> = {
  GEMINI: [
    { value: "", label: "default (gemini-flash-latest)" },
    { value: "gemini-flash-latest", label: "gemini-flash-latest" },
    { value: "gemini-1.5-pro", label: "gemini-1.5-pro" },
    { value: "gemini-1.5-flash", label: "gemini-1.5-flash" },
  ],
  OPENAI: [
    { value: "", label: "default (gpt-4o)" },
    { value: "gpt-4o", label: "gpt-4o" },
    { value: "gpt-4o-mini", label: "gpt-4o-mini" },
    { value: "gpt-4-turbo", label: "gpt-4-turbo" },
  ],
};

export function AiSettingsTab({ initial }: { initial: AiSettingsData }) {
  const [form, setForm] = useState(initial);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">AI Provider</h2>
        <p className="mt-1 text-sm text-slate-500">
          ใช้สำหรับแปลภาษาอัตโนมัติในหน้า{" "}
          <span className="font-medium text-slate-600">แปลภาษา</span> — ต้องตั้งค่า API Key ใน .env
          (GOOGLE_AI_API_KEY / OPENAI_API_KEY) ก่อนใช้งาน
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PROVIDERS.map((p) => {
          const active = form.provider === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => setForm({ provider: p.value, model: "" })}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
                active ? "border-brand-navy ring-2 ring-brand-navy/30" : "border-slate-200 hover:border-slate-300",
              )}
            >
              <span className="text-sm font-semibold text-slate-800">{p.label}</span>
              <span className="text-xs text-slate-400">{p.description}</span>
            </button>
          );
        })}
      </div>

      <div className="max-w-xs">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">AI Model</label>
        <Select
          value={form.model}
          options={MODEL_OPTIONS[form.provider]}
          onChange={(v) => setForm((s) => ({ ...s, model: v }))}
        />
      </div>

      <div>
        <SaveButton label="บันทึกการตั้งค่า AI" onSave={() => saveAiSettings(form).then(() => {})} />
      </div>
    </div>
  );
}
