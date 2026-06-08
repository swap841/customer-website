"use client";

import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export interface AppConfig {
  branding: Record<string, any>;
  store: Record<string, any>;
  features: Record<string, boolean>;
  seo: Record<string, any>;
  contact: Record<string, any>;
  ai?: Record<string, any>;
}

const DEFAULT_CONFIG: AppConfig = {
  branding: { name: "My Store", logoUrl: "", primaryColor: "#059669", accentColor: "#0D9488" },
  store: { isOpen: true, maintenanceMode: false, minOrderValue: 199, deliveryCharge: 40, freeDeliveryAbove: 499 },
  features: {},
  seo: {},
  contact: {},
  ai: {},
};

async function fetchAppConfig(): Promise<AppConfig> {
  try {
    const ref = doc(db, "appConfig", "settings");
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return {
        branding: data.business || DEFAULT_CONFIG.branding,
        store: data.store || DEFAULT_CONFIG.store,
        features: data.features || DEFAULT_CONFIG.features,
        seo: data.seo || DEFAULT_CONFIG.seo,
        contact: data.contact || DEFAULT_CONFIG.contact,
        ai: data.ai || DEFAULT_CONFIG.ai,
      };
    }
  } catch {}
  return DEFAULT_CONFIG;
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
