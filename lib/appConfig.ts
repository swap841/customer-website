import { db } from "@/lib/firebaseClient";
import { doc, getDoc, onSnapshot, Unsubscribe } from "firebase/firestore";

export interface AppConfig {
  business?: {
    name?: string;
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    font?: string;
    currency?: string;
    currencySymbol?: string;
    taxRate?: number;
    taxName?: string;
  };
  store?: {
    isOpen?: boolean;
    maintenanceMode?: boolean;
    minOrderValue?: number;
    deliveryCharge?: number;
    freeDeliveryAbove?: number;
    taxPercent?: number;
    location?: { address?: string; lat?: number; lng?: number };
  };
  features?: {
    voiceSearch?: boolean;
    wishlist?: boolean;
    coupons?: boolean;
    reviews?: boolean;
    chatbot?: boolean;
    loyalty?: boolean;
    posMode?: boolean;
    creditSystem?: boolean;
  };
  contact?: { phone?: string; email?: string; address?: string };
  payment?: {
    codEnabled?: boolean;
    razorpayEnabled?: boolean;
    razorpayKeyId?: string;
  };
  deliveryZones?: {
    enabled?: boolean;
    localPincodes?: string[];
    deliveryCharges?: Record<string, number>;
    freeDeliveryThresholds?: Record<string, number>;
    maxLocalWeightKg?: number;
  };
  deliveryPartners?: {
    primary?: string;
    priority?: string[];
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
  };
  ai?: {
    geminiApiKey?: string;
  };
}

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-u2qq.onrender.com";
let cachedConfig: AppConfig | null = null;

export async function getAppConfig(forceRefresh = false): Promise<AppConfig> {
  if (!forceRefresh && cachedConfig) return cachedConfig;
  try {
    const snap = await getDoc(doc(db, "appConfig", "settings"));
    if (snap.exists()) {
      const data = snap.data() as AppConfig;
      cachedConfig = data;
      return data;
    }
  } catch {}
  try {
    const res = await fetch(`${SERVER_URL}/api/config`);
    const data = await res.json();
    if (data && data.id) {
      cachedConfig = data;
      return data;
    }
  } catch {}
  return cachedConfig || {};
}

export function subscribeToConfig(callback: (config: AppConfig) => void): Unsubscribe {
  return onSnapshot(doc(db, "appConfig", "settings"), (snap) => {
    if (snap.exists()) {
      const data = snap.data() as AppConfig;
      cachedConfig = data;
      callback(data);
    }
  });
}

export function isStoreOpen(config: AppConfig): boolean {
  if (config.store?.maintenanceMode) return false;
  return config.store?.isOpen !== false;
}

export function isFeatureEnabled(config: AppConfig, feature: string): boolean {
  return (config.features as any)?.[feature] === true;
}

export function isPincodeInZone(config: AppConfig, pincode: string): boolean {
  if (!config.deliveryZones?.enabled || !config.deliveryZones?.localPincodes) return true;
  return config.deliveryZones.localPincodes.includes(pincode);
}
