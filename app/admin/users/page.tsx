import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserManagementClient } from "@/components/admin/users/UserManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [session, users] = await Promise.all([
    auth(),
    prisma.user.findMany({
      where: { role: { not: "CUSTOMER" } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <UserManagementClient
      currentUserId={session?.user?.id ?? null}
      users={users.map((u) => ({
        id: u.id,
        name: u.name ?? u.email,
        email: u.email,
        role: u.role,
        disabled: u.disabled,
        emailVerified: !!u.emailVerified,
        createdAt: u.createdAt.toISOString(),
      }))}
      totalCount={users.length}
      adminCount={adminCount}
    />
  );
}
