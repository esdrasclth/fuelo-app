// Lightweight in-memory fixed-window rate limiter.
//
// Caveat: on serverless each instance keeps its own counters, so this is a
// best-effort first layer against naive brute force, not a distributed
// guarantee. For strict cross-instance limits, back this with Redis/Upstash.

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();
let opsSinceSweep = 0;

function sweep(now: number) {
  for (const [key, w] of windows) {
    if (w.resetAt <= now) windows.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();

  // Opportunistically drop expired windows so the map can't grow unbounded.
  if (++opsSinceSweep >= 500) {
    opsSinceSweep = 0;
    sweep(now);
  }

  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  current.count++;
  if (current.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((current.resetAt - now) / 1000),
    };
  }
  return { ok: true, remaining: limit - current.count, retryAfterSec: 0 };
}

/** Best-effort client IP from the proxy headers Vercel sets. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
