"use client";

import { useQuery } from "@tanstack/react-query";

export interface AppConfig {
  branding: Record<string, any>;
  store: Record<string, any>;
  features: Record<string, boolean>;
  seo: Record<string, any>;
  contact: Record<string, any>;
}

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-10ct.onrender.com";

async function fetchAppConfig() {
  const res = await fetch(`${SERVER_URL}/api/config`);
  if (!res.ok) throw new Error("Failed to load config");
  return res.json();
}

export function useAppConfig() {
  return useQuery({
    queryKey: ["appConfig"],
    queryFn: fetchAppConfig,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}
