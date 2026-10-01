"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_CONTACT_CONFIG,
  inputAttrs,
  validateContact,
  type ContactConfig,
  type ContactSubmission,
  type StandardField,
} from "@/lib/contact-config";
import { ui, type UiKey } from "@/lib/i18n/ui";
import { canonicalPageId, pushDataLayerEvent } from "@/lib/analytics/dataLayerEvents";

const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-navy";

const LABELS: Record<StandardField, UiKey> = {
  name: "formName",
  email: "formEmail",
  phone: "formPhone",
  subject: "formSubject",
  message: "formMessage",
};

const EMPTY: ContactSubmission = { name: "", email: "", phone: "", subject: "", message: "", custom: {} };

/** Contact form driven by the admin-configured fields (Admin → จัดการฟอร์มติดต่อ). */
export function ContactForm({
  config = DEFAULT_CONTACT_CONFIG,
  locale = "th",
  onSubmitted,
}: {
  config?: ContactConfig;
  locale?: string;
  /** Called with the saved message id (used for the generate_lead analytics event). */
  onSubmitted?: (id: string) => void;
}) {
  const [form, setForm] = useState<ContactSubmission>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const t = (key: UiKey) => ui(locale, key);
  // Admin-entered labels and validation messages exist in Thai and English only.
  const lang: "th" | "en" = locale === "th" ? "th" : "en";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const found = validateContact(form, config, lang);
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, body: form.message, lang }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErrors(data.fieldErrors ?? {});
      setError(data.error ?? t("formError"));
      return;
    }
    onSubmitted?.(data.id);
    // event_id is keyed to the stored message id, so a retry or refresh can't duplicate it.
    if (data.id) pushDataLayerEvent("generate_lead", { dedupeKey: `lead.${data.id}`, params: { page_id: canonicalPageId() } });
    setSent(true);
    setForm(EMPTY);
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-site-bg p-8 text-center">
        <p className="text-lg font-semibold text-brand-navy">{t("formSent")}</p>
        <p className="mt-1 text-sm text-slate-500">{t("formSentBody")}</p>
        <button type="button" onClick={() => setSent(false)} className="mt-4 text-sm font-medium text-brand-navy underline underline-offset-2">
          {t("formSendAgain")}
        </button>
      </div>
    );
  }

  const fieldError = (key: string) => errors[key] && <p className="mt-1 text-xs text-red-600">{errors[key]}</p>;
  const standard = (key: Exclude<StandardField, "message">) => {
    const cfg = config.fields[key];
    if (!cfg.enabled) return null;
    const attrs = inputAttrs(cfg.validation);
    return (
      <div key={key}>
        <label htmlFor={`contact-${key}`} className="mb-1.5 block text-sm font-medium text-slate-700">
          {t(LABELS[key])}
          {cfg.required && <span className="text-red-500"> *</span>}
        </label>
        <input
          id={`contact-${key}`}
          {...attrs}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          aria-invalid={!!errors[key]}
          className={cn(inputClass, errors[key] && "border-red-400")}
        />
        {fieldError(key)}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {standard("name")}
        {standard("email")}
        {standard("phone")}
        {standard("subject")}
        {config.customFields
          .filter((f) => f.labelTh)
          .map((f) => {
            const key = `custom:${f.id}`;
            const label = (lang === "en" && f.labelEn) || f.labelTh;
            if (f.type === "checkbox") {
              return (
                <div key={f.id} className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.custom[f.id] === true}
                      onChange={(e) => setForm((s) => ({ ...s, custom: { ...s.custom, [f.id]: e.target.checked } }))}
                    />
                    {label}
                    {f.required && <span className="text-red-500">*</span>}
                  </label>
                  {fieldError(key)}
                </div>
              );
            }
            return (
              <div key={f.id}>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {label}
                  {f.required && <span className="text-red-500"> *</span>}
                </label>
                {f.type === "select" ? (
                  <select
                    value={String(form.custom[f.id] ?? "")}
                    onChange={(e) => setForm((s) => ({ ...s, custom: { ...s.custom, [f.id]: e.target.value } }))}
                    className={cn(inputClass, errors[key] && "border-red-400")}
                  >
                    <option value="">{t("formSelect")}</option>
                    {f.options
                      .split("\n")
                      .map((o) => o.trim())
                      .filter(Boolean)
                      .map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                  </select>
                ) : (
                  <input
                    {...inputAttrs(f.validation)}
                    value={String(form.custom[f.id] ?? "")}
                    onChange={(e) => setForm((s) => ({ ...s, custom: { ...s.custom, [f.id]: e.target.value } }))}
                    className={cn(inputClass, errors[key] && "border-red-400")}
                  />
                )}
                {fieldError(key)}
              </div>
            );
          })}
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-slate-700">
          {t(LABELS.message)}
          <span className="text-red-500"> *</span>
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          aria-invalid={!!errors.message}
          className={cn(inputClass, errors.message && "border-red-400")}
        />
        {fieldError("message")}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-navy-dark transition-colors hover:bg-brand-gold-dark disabled:opacity-60 sm:self-start"
      >
        {loading ? t("formSending") : t("formSend")}
      </button>
    </form>
  );
}
