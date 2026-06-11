"use client";

import { useEffect, useState, useRef } from "react";
import { fetchBatchStock } from "@/lib/stockService";

export function useBatchStock(productIds: string[]) {
  const [stockMap, setStockMap] = useState<Map<string, number>>(new Map());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idsRef = useRef<string[]>(productIds);

  idsRef.current = productIds;

  const fetch = async () => {
    const ids = idsRef.current;
    if (ids.length === 0) return;
    const map = await fetchBatchStock(ids);
    setStockMap(map);
  };

  useEffect(() => {
    fetch();
    intervalRef.current = setInterval(fetch, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [productIds.join(",")]);

  return stockMap;
}
