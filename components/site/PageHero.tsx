/**
 * Page title for public pages. The visible header band was removed site-wide; the
 * title is kept as a screen-reader-only <h1> so pages still have a heading for SEO
 * and accessibility.
 */
export async function PageHero({
  title,
}: {
  title: string;
  subtitle?: string | null;
  page?: { heroStyle: string | null; heroAlignment: string | null } | null;
}) {
  return <h1 className="sr-only">{title}</h1>;
}
