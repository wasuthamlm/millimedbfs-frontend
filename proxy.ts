import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const ADMIN_ROLES = new Set(["ADMIN", "EDITOR"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;
  if (!isAdminRoute) return NextResponse.next();

  const role = req.auth?.user?.role;
  if (!role || !ADMIN_ROLES.has(role)) {
    const loginUrl = new URL("/admin/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
