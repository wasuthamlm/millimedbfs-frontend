import { revalidatePath } from "next/cache";

/**
 * Invalidate every public page. Public routes live under app/(site)/[locale]
 * and are reached through proxy.ts rewrites (/about → /th/about), so literal
 * URL paths don't reliably match — revalidate the layouts instead.
 */
export function revalidateSite() {
  revalidatePath("/", "layout");
  revalidatePath("/[locale]", "layout");
}
