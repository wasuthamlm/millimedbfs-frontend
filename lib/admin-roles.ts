/** Roles allowed into the admin UI and admin-facing Server Actions. Keep this the single source of truth — proxy.ts (route gate) and require-admin.ts (action gate) must never define this list separately. */
export const ADMIN_ROLES = new Set(["ADMIN", "APPROVER", "CONTRIBUTOR"]);
