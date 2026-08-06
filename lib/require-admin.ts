import { auth } from "@/lib/auth";

const ADMIN_ROLES = new Set(["ADMIN", "APPROVER", "CONTRIBUTOR"]);

/** Call at the top of every admin-facing Server Action. Throws if the caller isn't an authenticated admin/approver/contributor. */
export async function requireAdmin() {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !ADMIN_ROLES.has(role)) {
    throw new Error("Unauthorized");
  }
  return session;
}
