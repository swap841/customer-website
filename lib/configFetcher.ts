import { defaultConfig, type StoreConfig } from "./defaultConfig";

let cachedConfig: StoreConfig | null = null;

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-u2qq.onrender.com";

export async function fetchConfig(): Promise<StoreConfig> {
  if (cachedConfig) return cachedConfig;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${SERVER_URL}/api/config`, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
      next: { revalidate: false },
    });

    clearTimeout(timeout);

    if (res.ok) {
      const remote = await res.json();
      if (remote && typeof remote === "object") {
        cachedConfig = mergeWithDefaults(remote);
        return cachedConfig;
      }
    }
  } catch {
    // Config fetch failed — fall through to defaults
  }

  return defaultConfig;
}

function mergeWithDefaults(remote: Record<string, unknown>): StoreConfig {
  const merged = { ...defaultConfig };

  if (remote.storeName) merged.storeName = String(remote.storeName);
  if (remote.storePhone) merged.storePhone = String(remote.storePhone);
  if (remote.storeEmail) merged.storeEmail = String(remote.storeEmail);
  if (remote.storeAddress) merged.storeAddress = String(remote.storeAddress);
  if (typeof remote.deliveryRadiusKm === "number") merged.deliveryRadiusKm = remote.deliveryRadiusKm;
  if (typeof remote.deliveryChargePerKm === "number") merged.deliveryChargePerKm = remote.deliveryChargePerKm;
  if (typeof remote.freeDeliveryAbove === "number") merged.freeDeliveryAbove = remote.freeDeliveryAbove;
  if (typeof remote.taxPercentage === "number") merged.taxPercentage = remote.taxPercentage;
  if (remote.workingHours) merged.workingHours = String(remote.workingHours);
  if (remote.socialMedia && typeof remote.socialMedia === "object") {
    merged.socialMedia = { ...merged.socialMedia, ...remote.socialMedia };
  }
  if (remote.aboutText) merged.aboutText = String(remote.aboutText);
  if (remote.deliveryTimeText) merged.deliveryTimeText = String(remote.deliveryTimeText);
  if (remote.outOfCityText) merged.outOfCityText = String(remote.outOfCityText);
  if (typeof remote.storeLat === "number") merged.storeLat = remote.storeLat;
  if (typeof remote.storeLng === "number") merged.storeLng = remote.storeLng;
  if (typeof remote.maxBasketWeightKg === "number") merged.maxBasketWeightKg = remote.maxBasketWeightKg;
  if (typeof remote.deliverySpeedKmph === "number") merged.deliverySpeedKmph = remote.deliverySpeedKmph;
  if (typeof remote.trafficMultiplier === "number") merged.trafficMultiplier = remote.trafficMultiplier;
  if (typeof remote.handlingTimeHours === "number") merged.handlingTimeHours = remote.handlingTimeHours;
  if (remote.currencySymbol) merged.currencySymbol = String(remote.currencySymbol);
  if (remote.storeLogo) merged.storeLogo = String(remote.storeLogo);
  if (remote.storeFavicon) merged.storeFavicon = String(remote.storeFavicon);
  if (remote.primaryColor) merged.primaryColor = String(remote.primaryColor);
  if (remote.accentColor) merged.accentColor = String(remote.accentColor);
  if (typeof remote.maintenanceMode === "boolean") merged.maintenanceMode = remote.maintenanceMode;
  if (typeof remote.isOpen === "boolean") merged.isOpen = remote.isOpen;
  if (typeof remote.minOrderValue === "number") merged.minOrderValue = remote.minOrderValue;

  return merged;
}

export function getCachedConfig(): StoreConfig | null {
  return cachedConfig;
}

export function setCachedConfig(config: StoreConfig): void {
  cachedConfig = config;
}