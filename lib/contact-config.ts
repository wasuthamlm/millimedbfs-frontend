// Contact-form configuration + validation shared by the browser form, the
// /api/contact route and the admin editor (ported from the legacy
// ContactLayoutPanel / CustomFieldsEditor / contactFormValidation). Pure — no
// server-only imports.

export type Validation = "none" | "email" | "phone" | "number" | "url";
export type StandardField = "name" | "email" | "phone" | "subject" | "message";
export type FieldConfig = { enabled: boolean; required: boolean; validation: Validation };
export type CustomField = {
  id: string;
  labelTh: string;
  labelEn: string;
  type: "text" | "select" | "checkbox";
  /** select: one option per line */
  options: string;
  required: boolean;
  validation: Validation;
};

export type ContactConfig = {
  layout: "info-left" | "info-right" | "stacked";
  showMap: boolean;
  fields: Record<StandardField, FieldConfig>;
  customFields: CustomField[];
};

export const DEFAULT_CONTACT_CONFIG: ContactConfig = {
  layout: "info-left",
  showMap: true,
  fields: {
    name: { enabled: true, required: true, validation: "none" },
    email: { enabled: true, required: true, validation: "email" },
    phone: { enabled: true, required: false, validation: "phone" },
    subject: { enabled: true, required: false, validation: "none" },
    message: { enabled: true, required: true, validation: "none" },
  },
  customFields: [],
};

/** name + message are required by the database and can't be switched off. */
export const LOCKED_FIELDS: StandardField[] = ["name", "message"];

export const VALIDATION_OPTIONS: { value: Validation; label: string }[] = [
  { value: "none", label: "ไม่ตรวจรูปแบบ" },
  { value: "email", label: "อีเมล" },
  { value: "phone", label: "เบอร์โทรศัพท์" },
  { value: "number", label: "ตัวเลขเท่านั้น" },
  { value: "url", label: "URL เว็บไซต์" },
];

export function normalizeContactConfig(stored: Partial<ContactConfig> | null | undefined): ContactConfig {
  const fields = { ...DEFAULT_CONTACT_CONFIG.fields };
  for (const key of Object.keys(fields) as StandardField[]) {
    fields[key] = { ...fields[key], ...(stored?.fields?.[key] ?? {}) };
    if (LOCKED_FIELDS.includes(key)) fields[key] = { ...fields[key], enabled: true, required: true };
  }
  return {
    layout: stored?.layout ?? DEFAULT_CONTACT_CONFIG.layout,
    showMap: stored?.showMap ?? true,
    fields,
    customFields: Array.isArray(stored?.customFields) ? stored.customFields.slice(0, 20) : [],
  };
}

export function inputAttrs(validation: Validation) {
  switch (validation) {
    case "email":
      return { type: "email", inputMode: "email" as const };
    case "phone":
      return { type: "tel", inputMode: "tel" as const };
    case "number":
      return { type: "text", inputMode: "numeric" as const };
    case "url":
      return { type: "url", inputMode: "url" as const };
    default:
      return { type: "text" };
  }
}

const PATTERNS: Record<Exclude<Validation, "none">, RegExp> = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9+() -]{6,20}$/,
  url: /^https?:\/\/.+/,
  number: /^[0-9]+$/,
};

const MESSAGES: Record<Exclude<Validation, "none"> | "required", [string, string]> = {
  required: ["กรุณากรอกข้อมูลนี้", "This field is required"],
  email: ["รูปแบบอีเมลไม่ถูกต้อง", "Invalid email format"],
  phone: ["รูปแบบเบอร์โทรไม่ถูกต้อง", "Invalid phone number"],
  url: ["รูปแบบ URL ไม่ถูกต้อง", "Invalid URL format"],
  number: ["กรุณากรอกตัวเลขเท่านั้น", "Numbers only"],
};

export type ContactSubmission = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  custom: Record<string, string | boolean>;
};

/** Returns fieldKey → error message; empty object means valid. Custom fields use key `custom:<id>`. */
export function validateContact(form: ContactSubmission, config: ContactConfig, lang: "th" | "en" = "th") {
  const errors: Record<string, string> = {};
  const msg = (k: keyof typeof MESSAGES) => MESSAGES[k][lang === "en" ? 1 : 0];
  const check = (key: string, raw: string, cfg: { required: boolean; validation: Validation }) => {
    const val = raw.trim();
    if (!val) {
      if (cfg.required) errors[key] = msg("required");
      return;
    }
    if (cfg.validation !== "none" && !PATTERNS[cfg.validation].test(val)) errors[key] = msg(cfg.validation);
  };

  (Object.keys(config.fields) as StandardField[]).forEach((key) => {
    const cfg = config.fields[key];
    if (!cfg.enabled) return;
    check(key, String(form[key] ?? ""), cfg);
  });
  config.customFields.forEach((f) => {
    if (!f.labelTh) return;
    const val = form.custom[f.id];
    if (f.type === "checkbox") {
      if (f.required && val !== true) errors[`custom:${f.id}`] = msg("required");
    } else if (f.type === "select") {
      const options = f.options.split("\n").map((o) => o.trim()).filter(Boolean);
      const v = String(val ?? "").trim();
      if (!v && f.required) errors[`custom:${f.id}`] = msg("required");
      else if (v && !options.includes(v)) errors[`custom:${f.id}`] = msg("required");
    } else {
      check(`custom:${f.id}`, String(val ?? ""), f);
    }
  });
  return errors;
}

/**
 * Stable fingerprint of the form's field set (never submitted values). The contact
 * page's marketing eligibility is stored with this fingerprint; if a field is added,
 * removed, switched on/off or made (non-)required, eligibility falls back to false
 * until an admin reviews it again (legacy src/lib/contactEligibility.js).
 */
export function contactFormFingerprint(config: ContactConfig): string {
  const fields = Object.entries(config.fields)
    .map(([key, f]) => `${key}:${f.enabled ? 1 : 0}${f.required ? 1 : 0}`)
    .sort();
  const custom = config.customFields
    .filter((f) => f.labelTh)
    .map((f) => `${f.labelTh}|${f.type}|${f.required ? 1 : 0}`)
    .sort();
  return [...fields, "::", ...custom].join(",").slice(0, 600);
}

export type ContactEligibility = { enabled: boolean; fingerprint: string };

export function isContactMarketingEligible(stored: Partial<ContactEligibility> | null | undefined, config: ContactConfig): boolean {
  return stored?.enabled === true && stored.fingerprint === contactFormFingerprint(config);
}
