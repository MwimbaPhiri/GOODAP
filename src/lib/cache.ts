/**
 * Lightweight cache abstraction.
 *
 * Uses an in-memory TTL store by default so the app runs with zero external
 * dependencies. If `REDIS_URL` is configured you can swap the implementation
 * for a real Redis client (ioredis) behind the same interface — the rest of
 * the codebase only depends on `cache.get/set/del/wrap`.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  /** Delete all keys beginning with the given prefix. */
  async delByPrefix(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }
}

const globalForCache = globalThis as unknown as { cache?: MemoryCache };

export const cache = globalForCache.cache ?? new MemoryCache();
if (process.env.NODE_ENV !== "production") globalForCache.cache = cache;

/** Memoize an async producer for `ttlSeconds`. */
export async function wrap<T>(key: string, ttlSeconds: number, producer: () => Promise<T>): Promise<T> {
  const cached = await cache.get<T>(key);
  if (cached !== null) return cached;
  const value = await producer();
  await cache.set(key, value, ttlSeconds);
  return value;
}
