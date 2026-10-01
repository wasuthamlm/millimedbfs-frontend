import "server-only";
import { prisma } from "@/lib/prisma";
import type { TranslatableEntity } from "@/lib/generated/prisma/client";

/**
 * Localized field reads (legacy getLF): Thai is the master language.
 *  - th → the Thai column
 *  - en → the English column, else a Translation row, else Thai
 *  - others → a Translation row (filled by AI from /admin/translations), else Thai
 *
 * Translation field names are the column name without the language suffix,
 * e.g. Post.titleTh → "title", Product.descriptionTh → "description".
 */
export type Localizer = (
  type: TranslatableEntity,
  id: string,
  field: string,
  th: string | null | undefined,
  en?: string | null,
) => string;

/** Same as Localizer but keeps "missing" as undefined (for optional fields such as excerpts). */
export type OptionalLocalizer = (
  type: TranslatableEntity,
  id: string,
  field: string,
  th: string | null | undefined,
  en?: string | null,
) => string | undefined;

const filled = (v: string | null | undefined): v is string => typeof v === "string" && v.trim() !== "";

/** A localizer that doesn't hit the database — Thai/English columns only. */
export function columnLocalizer(locale: string): Localizer {
  return (_type, _id, _field, th, en) => (locale === "en" && filled(en) ? en : (th ?? ""));
}

/**
 * Loads the Translation rows needed for `requests` in one query and returns a
 * synchronous lookup. For Thai no query is made.
 */
export async function loadLocalizer(
  locale: string,
  requests: [TranslatableEntity, (string | null | undefined)[]][],
): Promise<Localizer> {
  const wanted = requests
    .map(([type, ids]) => [type, ids.filter((id): id is string => !!id)] as const)
    .filter(([, ids]) => ids.length > 0);
  if (locale === "th" || wanted.length === 0) return columnLocalizer(locale);

  const rows = await prisma.translation.findMany({
    where: { locale, OR: wanted.map(([entityType, ids]) => ({ entityType, entityId: { in: [...new Set(ids)] } })) },
    select: { entityType: true, entityId: true, field: true, value: true },
  });
  const map = new Map(rows.map((r) => [`${r.entityType}:${r.entityId}:${r.field}`, r.value]));

  return (type, id, field, th, en) => {
    if (locale === "en" && filled(en)) return en;
    const tr = map.get(`${type}:${id}:${field}`);
    if (filled(tr)) return tr;
    return th ?? "";
  };
}

export function optional(t: Localizer): OptionalLocalizer {
  return (type, id, field, th, en) => {
    const v = t(type, id, field, th, en);
    return filled(v) ? v : undefined;
  };
}
