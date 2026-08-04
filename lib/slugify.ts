export function slugify(input: string) {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `item-${Math.random().toString(36).slice(2, 8)}`
  );
}
