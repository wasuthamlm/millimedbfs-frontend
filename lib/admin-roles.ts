/**
 * Role-based permission matrix for the admin panel (ported from the legacy
 * site's src/lib/permissions.js). Edge-safe — no Prisma — so proxy.ts can use
 * it too. Keep this the single source of truth for the route gate (proxy.ts),
 * the action gate (require-admin.ts) and the sidebar (AdminShell).
 *
 * ADMIN       — full access to everything.
 * APPROVER    — same as ADMIN except User Management and Activity Log.
 * CONTRIBUTOR — same as APPROVER except: cannot delete anything, cannot see
 *               Settings / Cookie Consent, and saves everything as Draft.
 */

export type AdminRole = "ADMIN" | "APPROVER" | "CONTRIBUTOR";

/** Roles allowed into the admin UI and admin-facing Server Actions. */
export const ADMIN_ROLES = new Set<string>(["ADMIN", "APPROVER", "CONTRIBUTOR"]);

const ALL: readonly AdminRole[] = ["ADMIN", "APPROVER", "CONTRIBUTOR"];
const ADMIN_APPROVER: readonly AdminRole[] = ["ADMIN", "APPROVER"];
const ADMIN_ONLY: readonly AdminRole[] = ["ADMIN"];

/**
 * Admin route prefixes that are restricted beyond "any admin role". Anything
 * not listed here is open to every admin role. Longest matching prefix wins.
 */
const SECTION_ACCESS: Record<string, readonly AdminRole[]> = {
  "/admin/users": ADMIN_ONLY,
  "/admin/activity": ADMIN_ONLY,
  "/admin/settings": ADMIN_APPROVER,
  "/admin/site/cookie": ADMIN_APPROVER,
};

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return !!role && ADMIN_ROLES.has(role);
}

/** Whether `role` may open the admin route at `pathname`. */
export function canAccessPath(role: string | null | undefined, pathname: string): boolean {
  if (!isAdminRole(role)) return false;
  let match: readonly AdminRole[] | undefined;
  let matchLen = -1;
  for (const [prefix, roles] of Object.entries(SECTION_ACCESS)) {
    if ((pathname === prefix || pathname.startsWith(prefix + "/")) && prefix.length > matchLen) {
      match = roles;
      matchLen = prefix.length;
    }
  }
  return match ? match.includes(role) : true;
}

/**
 * Page-level action permissions.
 *   create/edit → all admin roles
 *   delete      → ADMIN + APPROVER (contributor never deletes)
 *   publish     → ADMIN + APPROVER (contributor is draft-only)
 */
export const ACTIONS = {
  "article.create": ALL,
  "article.edit": ALL,
  "article.delete": ADMIN_APPROVER,
  "article.publish": ADMIN_APPROVER,

  "product.create": ALL,
  "product.edit": ALL,
  "product.delete": ADMIN_APPROVER,
  "product.publish": ADMIN_APPROVER,

  "category.create": ALL,
  "category.edit": ALL,
  "category.delete": ADMIN_APPROVER,
  "category.publish": ADMIN_APPROVER,

  "page.create": ALL,
  "page.edit": ALL,
  "page.delete": ADMIN_APPROVER,
  "page.publish": ADMIN_APPROVER,

  "media.upload": ALL,
  "media.delete": ADMIN_APPROVER,

  "menu.create": ALL,
  "menu.edit": ALL,
  "menu.delete": ADMIN_APPROVER,
  "menu.reorder-top": ADMIN_APPROVER,

  "widget.edit": ALL,
  "widget.delete": ADMIN_APPROVER,

  "banner.edit": ALL,
  "banner.delete": ADMIN_APPROVER,
  "banner.publish": ADMIN_APPROVER,

  "popup.edit": ALL,
  "popup.delete": ADMIN_APPROVER,
  "popup.publish": ADMIN_APPROVER,

  "site.edit": ALL,

  "translation.edit": ALL,

  "contact.read": ALL,
  "contact.delete": ADMIN_APPROVER,

  "settings.edit": ADMIN_APPROVER,
  "users.manage": ADMIN_ONLY,
  "activity.view": ADMIN_ONLY,
} as const satisfies Record<string, readonly AdminRole[]>;

export type AdminAction = keyof typeof ACTIONS;

export function canDo(role: string | null | undefined, action: AdminAction): boolean {
  return isAdminRole(role) && (ACTIONS[action] as readonly AdminRole[]).includes(role);
}
