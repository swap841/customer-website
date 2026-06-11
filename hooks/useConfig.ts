"use client";

import { useEffect, useState } from "react";
import type { StoreConfig } from "@/lib/defaultConfig";

let configCache: StoreConfig | null = null;

export function useConfig(): StoreConfig {
  const [config, setConfig] = useState<StoreConfig | null>(null);

  useEffect(() => {
    if (configCache) {
      setConfig(configCache);
      return;
    }

    const script = document.getElementById("__APP_CONFIG__") as HTMLScriptElement | null;
    if (script) {
      try {
        const parsed = JSON.parse(script.textContent || "{}");
        configCache = parsed;
        setConfig(parsed);
      } catch {
        console.warn("[useConfig] Failed to parse injected config");
      }
    } else {
      console.warn("[useConfig] Config script not found, using defaults");
    }
  }, []);

  return config || (typeof window !== "undefined" ? (window as any).__APP_CONFIG__ : {}) as StoreConfig;
}

export function getConfigSync(): StoreConfig | null {
  if (configCache) return configCache;
  if (typeof window !== "undefined") {
    const script = document.getElementById("__APP_CONFIG__") as HTMLScriptElement | null;
    if (script) {
      try {
        configCache = JSON.parse(script.textContent || "{}");
        return configCache;
      } catch {}
    }
    return (window as any).__APP_CONFIG__ || null;
  }
  return null;
}

export function setConfig(config: StoreConfig): void {
  configCache = config;
}