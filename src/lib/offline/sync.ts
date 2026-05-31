import { db } from "@/lib/offline/db";
import { api } from "@/lib/api-client";

export async function enqueueFuelLog(payload: Record<string, unknown>) {
  const id = String(payload.clientId);
  await db.outbox.put({ id, payload, createdAt: Date.now() });
}

export async function outboxCount(): Promise<number> {
  return db.outbox.count();
}

/**
 * Replays queued fuel-log creations to the server. Stops at the first network
 * failure (we're likely offline again). Returns the number synced.
 */
export async function flushOutbox(): Promise<number> {
  const items = await db.outbox.orderBy("createdAt").toArray();
  let synced = 0;

  for (const item of items) {
    try {
      await api.post("/api/fuel-logs", item.payload);
      await db.outbox.delete(item.id);
      synced++;
    } catch (err) {
      // A thrown TypeError means the request never reached the server (offline).
      if (err instanceof TypeError) break;
      // Any server-side rejection (e.g. validation) — drop it to avoid a poison
      // message that blocks the queue forever.
      await db.outbox.delete(item.id);
    }
  }

  return synced;
}
