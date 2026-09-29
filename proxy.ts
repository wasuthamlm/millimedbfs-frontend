import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/lib/auth.config";
import { canAccessPath, isAdminRole } from "@/lib/admin-roles";
import { prisma } from "@/lib/prisma";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;
  if (!isAdminRoute) return NextResponse.next();

  const loginUrl = new URL("/admin/login", req.nextUrl);
  loginUrl.searchParams.set("callbackUrl", pathname);

  const userId = req.auth?.user?.id;
  if (!userId || !isAdminRole(req.auth?.user?.role)) {
    return NextResponse.redirect(loginUrl);
  }

  // The JWT can outlive a role change or a disable, so confirm both against the
  // database. Proxy runs on the Node.js runtime in Next 16, so Prisma is fine
  // here; the lookup only happens for /admin routes.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, disabled: true },
  });
  if (!user || user.disabled || !isAdminRole(user.role)) {
    return NextResponse.redirect(loginUrl);
  }
  if (!canAccessPath(user.role, pathname)) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
