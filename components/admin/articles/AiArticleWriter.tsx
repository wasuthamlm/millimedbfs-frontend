"use client";

import { useState, useTransition } from "react";
import { SparklesIcon } from "@/components/ui/admin-icons";
import { aiGenerateArticle, type GeneratedArticle } from "@/app/admin/ai/actions";

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

/**
 * "Write with AI" panel (ported from the legacy AIArticleWriter): generates a
 * full Thai SEO/AEO/GEO article draft — body, excerpt, meta, keywords, FAQ —
 * and hands it to the form to review before saving.
 */
export function AiArticleWriter({ onGenerated }: { onGenerated: (article: GeneratedArticle) => void }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState({ topic: "", focusKeyword: "", audience: "", tone: "เป็นกันเอง น่าเชื่อถือ", notes: "" });

  const generate = () =>
    startTransition(async () => {
      setError(null);
      const res = await aiGenerateArticle(input);
      if (res.error || !res.data) {
        setError(res.error ?? "AI ทำงานไม่สำเร็จ");
        return;
      }
      onGenerated(res.data);
      setOpen(false);
    });

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 self-start rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
      >
        <SparklesIcon className="h-4 w-4" />
        เขียนบทความด้วย AI
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-violet-200 bg-violet-50/50 p-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-violet-800">
          <SparklesIcon className="h-4 w-4" />
          เขียนบทความด้วย AI
        </h3>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-500 hover:text-slate-700">
          ปิด
        </button>
      </div>
      <input className={inputClass} placeholder="หัวข้อบทความ เช่น วิธีเลือกน้ำตาเทียมให้เหมาะกับตา" value={input.topic} onChange={(e) => setInput({ ...input, topic: e.target.value })} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input className={inputClass} placeholder="คีย์เวิร์ดหลัก" value={input.focusKeyword} onChange={(e) => setInput({ ...input, focusKeyword: e.target.value })} />
        <input className={inputClass} placeholder="กลุ่มเป้าหมาย" value={input.audience} onChange={(e) => setInput({ ...input, audience: e.target.value })} />
        <input className={inputClass} placeholder="น้ำเสียง" value={input.tone} onChange={(e) => setInput({ ...input, tone: e.target.value })} />
      </div>
      <textarea rows={3} className={inputClass} placeholder="ข้อมูลเพิ่มเติม / ประเด็นที่ต้องการให้ครอบคลุม (ไม่บังคับ)" value={input.notes} onChange={(e) => setInput({ ...input, notes: e.target.value })} />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-slate-500">AI จะเติมชื่อเรื่อง เนื้อหา สรุปย่อ SEO และ FAQ ลงฟอร์ม — ตรวจทานความถูกต้องทางการแพทย์ก่อนเผยแพร่ทุกครั้ง</p>
      <button
        type="button"
        onClick={generate}
        disabled={pending || !input.topic.trim()}
        className="self-start rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "กำลังเขียน... (อาจใช้เวลา 1–2 นาที)" : "สร้างบทความ"}
      </button>
    </div>
  );
}
