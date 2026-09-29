import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import authConfig from "@/lib/auth.config";
import { canAccessPath, isAdminRole } from "@/lib/admin-roles";
import { prisma } from "@/lib/prisma";
import { DEFAULT_LOCALE, splitLocale } from "@/lib/i18n/locales";
import { getEnabledLocales } from "@/lib/i18n/enabled-locales";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return adminGate(req, pathname, req.auth?.user);
  }
  return localeRouting(req, pathname);
});

async function adminGate(
  req: NextRequest,
  pathname: string,
  sessionUser: { id?: string; role?: string } | undefined,
) {
  if (pathname === "/admin/login") return NextResponse.next();

  const loginUrl = new URL("/admin/login", req.nextUrl);
  loginUrl.searchParams.set("callbackUrl", pathname);

  const userId = sessionUser?.id;
  if (!userId || !isAdminRole(sessionUser?.role)) {
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
}

/**
 * Every public route lives under app/(site)/[locale]. Thai (the default) is
 * served without a prefix, so "/about" is rewritten to "/th/about"; "/en/about"
 * passes straight through. "/th/..." and disabled locales redirect to the
 * unprefixed Thai URL so each page has one canonical address.
 */
async function localeRouting(req: NextRequest, pathname: string) {
  const { locale, path, prefixed } = splitLocale(pathname);

  if (!prefixed) {
    const url = req.nextUrl.clone();
    url.pathname = path === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${path}`;
    return NextResponse.rewrite(url);
  }

  if (locale === DEFAULT_LOCALE || !(await getEnabledLocales()).includes(locale)) {
    const url = req.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Everything except API routes, Next internals and files with an extension
  // (robots.txt, sitemap.xml, icon.png, /images/*, …).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
