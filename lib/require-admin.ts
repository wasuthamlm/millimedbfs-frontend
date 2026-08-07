import { auth } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/admin-roles";

/** Call at the top of every admin-facing Server Action. Throws if the caller isn't an authenticated admin/approver/contributor. */
export async function requireAdmin() {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !ADMIN_ROLES.has(role)) {
    throw new Error("Unauthorized");
  }
  return session;
}
