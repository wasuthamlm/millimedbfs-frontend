// Shared by both the admin block editor preview and the live public page so
// the two never drift apart. Convention: the first line is the intro
// paragraph; every line after it is rendered as a bullet point (matches how
// content like certification lists is typically written — one line each).
export function BlockBodyText({ text, className }: { text: string; className?: string }) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  const [first, ...rest] = lines;

  return (
    <div className={className}>
      <p>{first}</p>
      {rest.length > 0 && (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {rest.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
