// Shared by both the admin block editor preview and the live public page so
// the two never drift apart. Content is stored as rich-text HTML (from the
// admin RichTextEditor). Older sections saved before rich text existed still
// hold plain text — detect that (no tags) and fall back to the original
// convention: first line is the intro paragraph, remaining lines are bullets.
export function BlockBodyText({ text, className }: { text: string; className?: string }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(text);

  if (isHtml) {
    return <div className={`prose prose-sm max-w-none ${className ?? ""}`} dangerouslySetInnerHTML={{ __html: text }} />;
  }

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
