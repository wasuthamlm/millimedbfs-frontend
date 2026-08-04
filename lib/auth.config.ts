import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/lib/generated/prisma/client";

// Edge-safe subset of the Auth.js config — no Prisma adapter, no bcrypt.
// Used directly by middleware.ts; lib/auth.ts extends this with the
// Node-only Credentials provider + Prisma adapter for Route Handlers /
// Server Actions / Server Components.
export default {
  // Vercel sets this automatically; needed explicitly for self-hosting /
  // local dev on a non-default port since Auth.js v5 validates the Host
  // header against a trusted-host allowlist by default.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role as Role;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.role = token.role as Role;
      return session;
    },
  },
} satisfies NextAuthConfig;
