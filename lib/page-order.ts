// Manual display order for the Page Manager list, matching the reference
// export (Page_export.csv) the client provided. Pages not in this list
// (created later, via the UI) sort after all of these, newest first.
export const PAGE_ORDER: string[] = [
  "home",
  "about",
  "contact",
  "article",
  "bfs",
  "center_lab_building",
  "OSD_building",
  "automated_warehouse",
  "hormone",
  "Weerachai_Building",
  "weerachai_high_tech",
  "manufacturing/office",
  "manufacturing-standards",
  "product/eye-drops",
  "drug-information/artificial-tears",
  "drug-information/capsule",
  "drug-information/tablet",
  "product/hormone",
  "drug-information",
  "drug-information/powder",
  "drug-information/lozenge",
  "product/tablet",
  "csr-and-event",
  "manufacturing",
  "drug-information/eye-drops",
  "product",
  "drug-information/hormone",
  "product/eye-medicine-info",
];

export function sortByPageOrder<T extends { slug: string; updatedAt: Date }>(pages: T[]): T[] {
  return [...pages].sort((a, b) => {
    const ai = PAGE_ORDER.indexOf(a.slug);
    const bi = PAGE_ORDER.indexOf(b.slug);
    if (ai === -1 && bi === -1) return b.updatedAt.getTime() - a.updatedAt.getTime();
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}
