const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-u2qq.onrender.com";

const cache = new Map<string, { stock: number; ts: number }>();
const CACHE_TTL = 30_000;

export async function fetchBatchStock(productIds: string[]): Promise<Map<string, number>> {
  const now = Date.now();
  const result = new Map<string, number>();
  const uncached: string[] = [];

  for (const id of productIds) {
    const entry = cache.get(id);
    if (entry && now - entry.ts < CACHE_TTL) {
      result.set(id, entry.stock);
    } else {
      uncached.push(id);
    }
  }

  if (uncached.length === 0) return result;

  try {
    const res = await fetch(`${SERVER_URL}/api/products/stock-batch?ids=${uncached.join(",")}`);
    if (!res.ok) throw new Error("Stock batch fetch failed");
    const data: Record<string, number> = await res.json();
    for (const [id, stock] of Object.entries(data)) {
      cache.set(id, { stock, ts: now });
      result.set(id, stock);
    }
  } catch {
    for (const id of uncached) {
      if (!result.has(id)) result.set(id, 0);
    }
  }

  return result;
}
