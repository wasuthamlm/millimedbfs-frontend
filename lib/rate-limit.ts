/**
 * In-memory fixed-window rate limiter. Good enough for this site's traffic level
 * without adding a Redis/Upstash dependency. Resets on server restart and doesn't
 * share state across serverless instances — acceptable here since the goal is
 * blunting casual scripted abuse, not hardening against a determined attacker
 * with many source IPs.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now >= entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > limit;
}

export function clientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
