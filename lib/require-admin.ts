import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canDo, isAdminRole, type AdminAction, type AdminRole } from "@/lib/admin-roles";

/**
 * Call at the top of every admin-facing Server Action. Throws if the caller
 * isn't an authenticated, enabled admin/approver/contributor.
 *
 * The role is re-read from the database rather than trusted from the JWT, so
 * disabling a user or changing their role takes effect on their next action
 * instead of when their session token expires.
 */
export async function requireAdmin() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true, disabled: true },
  });
  if (!user || user.disabled || !isAdminRole(user.role)) {
    throw new Error("Unauthorized");
  }
  session.user.role = user.role;
  return session as typeof session & { user: { id: string; role: AdminRole } };
}

/** requireAdmin() plus a check against the permission matrix in lib/admin-roles.ts. */
export async function requirePermission(action: AdminAction) {
  const session = await requireAdmin();
  if (!canDo(session.user.role, action)) throw new Error("Forbidden");
  return session;
}

/** The signed-in admin's current (database) role, or null — for rendering, never throws. */
export async function getAdminRole(): Promise<AdminRole | null> {
  try {
    return (await requireAdmin()).user.role;
  } catch {
    return null;
  }
}
