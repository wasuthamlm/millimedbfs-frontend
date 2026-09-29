export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatThaiDate(iso: string) {
  return new Date(iso).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatCurrencyTHB(amount: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Date → "yyyy-MM-ddTHH:mm" in Bangkok time, for <input type="datetime-local"> (same output on server and client). */
export function toBangkokInput(date: Date | null | undefined): string {
  if (!date) return "";
  const bkk = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return bkk.toISOString().slice(0, 16);
}

/** "yyyy-MM-ddTHH:mm" (Bangkok time) → ISO string, or "" when empty. */
export function fromBangkokInput(value: string): string {
  return value ? new Date(`${value}:00+07:00`).toISOString() : "";
}
