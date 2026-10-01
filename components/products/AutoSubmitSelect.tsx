"use client";

/** A <select> that submits its form on change (works without JS via the form's submit button). */
export function AutoSubmitSelect({
  name,
  defaultValue,
  options,
  ariaLabel,
  className,
}: {
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  ariaLabel: string;
  className?: string;
}) {
  return (
    <select name={name} defaultValue={defaultValue} aria-label={ariaLabel} className={className} onChange={(e) => e.currentTarget.form?.requestSubmit()}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
