import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { createDbSocket } from "@/lib/db-socket";

// Keep pooled connections alive for a while so each request doesn't open a
// fresh connection — every new connection means a DNS lookup of the Supabase
// pooler host, and on flaky networks those lookups intermittently fail.
// Sockets resolve the host with a fallback to public DNS (lib/db-socket.ts).
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  stream: createDbSocket,
  idleTimeoutMillis: 5 * 60_000,
  connectionTimeoutMillis: 15_000,
});

// Errors raised while *opening* a connection (DNS failure, host unreachable,
// refused). The query never reached the database, so retrying is safe even
// for writes. Errors after the query was sent (e.g. ECONNRESET) are not retried.
const TRANSIENT = /EAI_AGAIN|ENOTFOUND|ECONNREFUSED|EHOSTUNREACH|ENETUNREACH|DatabaseNotReachable|P1001|Can't reach database server/;
const MAX_ATTEMPTS = 3;

function isTransientConnectError(err: unknown): boolean {
  const e = err as { code?: unknown; message?: unknown; cause?: unknown } | null;
  const text = [e?.code, e?.message, String(e?.cause ?? "")].join(" ");
  return TRANSIENT.test(text);
}

function createClient() {
  return new PrismaClient({ adapter }).$extends({
    query: {
      async $allOperations({ args, query }) {
        for (let attempt = 1; ; attempt++) {
          try {
            return await query(args);
          } catch (err) {
            if (attempt >= MAX_ATTEMPTS || !isTransientConnectError(err)) throw err;
            await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
          }
        }
      },
    },
  });
}

type Client = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as unknown as { prisma?: Client };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
