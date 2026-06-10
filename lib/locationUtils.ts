import { getDistanceKm } from "@/utils/distance";
import { getAppConfig, type AppConfig } from "@/lib/appConfig";

export interface DeliveryZoneInfo {
  isLocal: boolean;
  distanceKm: number;
  partition: string;
  deliveryType: "own" | "thirdParty";
  estimatedHours: number;
  pincode?: string;
}

export interface PincodeValidation {
  valid: boolean;
  pincode: string;
  city: string;
  state: string;
  district: string;
  country: string;
  area: string;
  warning?: string;
  error?: string;
}

function getPartition(distanceKm: number): string {
  if (distanceKm <= 10) return "zone_0_10";
  if (distanceKm <= 20) return "zone_10_20";
  if (distanceKm <= 30) return "zone_20_30";
  if (distanceKm <= 50) return "zone_30_50";
  return "zone_50_plus";
}

function getDeliveryType(distanceKm: number, maxKm: number): "own" | "thirdParty" {
  return distanceKm <= maxKm ? "own" : "thirdParty";
}

function getEstimatedHours(distanceKm: number, isThirdParty: boolean): number {
  if (isThirdParty) return Math.max(24, Math.ceil(distanceKm / 40) * 8);
  if (distanceKm <= 5) return 1;
  if (distanceKm <= 10) return 2;
  if (distanceKm <= 20) return 3;
  return Math.ceil(distanceKm / 20) * 2;
}

export async function getDeliveryZoneInfo(
  lat: number,
  lng: number
): Promise<DeliveryZoneInfo> {
  const config = await getAppConfig(true);
  const storeLat = config.store?.location?.lat ?? 17.6868;
  const storeLng = config.store?.location?.lng ?? 74.0066;
  const maxKm = config.deliveryZones?.enabled ? 50 : 20;

  const dist = getDistanceKm(storeLat, storeLng, lat, lng);
  const deliveryType = getDeliveryType(dist, maxKm);
  const estimatedHours = getEstimatedHours(dist, deliveryType === "thirdParty");

  return {
    isLocal: deliveryType === "own",
    distanceKm: Math.round(dist * 10) / 10,
    partition: getPartition(dist),
    deliveryType,
    estimatedHours,
  };
}

export async function validatePincode(
  pincode: string
): Promise<PincodeValidation> {
  const SERVER_URL =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    "https://grocery-server-u2qq.onrender.com";

  try {
    const res = await fetch(`${SERVER_URL}/api/validate-pincode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pincode }),
    });
    return await res.json();
  } catch {
    // Fallback client-side: basic 6-digit check
    return {
      valid: /^\d{6}$/.test(pincode),
      pincode,
      city: "",
      state: "",
      district: "",
      country: "India",
      area: "",
      warning: "Offline validation",
    };
  }
}

export function isPincodeLocal(
  pincode: string,
  config: AppConfig
): boolean {
  const zones = config.deliveryZones;
  if (!zones?.enabled) return true;
  return zones.localPincodes?.includes(pincode) ?? true;
}

export function getDeliveryChargeForDistance(
  distanceKm: number,
  config: AppConfig
): { deliveryCharge: number; freeDelivery: boolean } {
  const store = config.store ?? {};
  const freeAbove = store.freeDeliveryAbove ?? 100;
  const perKm = config.store?.deliveryCharge ?? 5;
  const charge = Math.round(distanceKm * perKm);
  return { deliveryCharge: charge, freeDelivery: false };
}

export function getGeoHash(lat: number, lng: number, precision: number = 6): string {
  const chars = "0123456789bcdefghjkmnpqrstuvwxyz";
  let minLat = -90, maxLat = 90;
  let minLng = -180, maxLng = 180;
  let hash = "";
  let isEven = true;
  let bit = 0;
  let ch = 0;

  while (hash.length < precision) {
    if (isEven) {
      const mid = (minLng + maxLng) / 2;
      if (lng > mid) {
        ch |= 1 << (4 - bit);
        minLng = mid;
      } else {
        maxLng = mid;
      }
    } else {
      const mid = (minLat + maxLat) / 2;
      if (lat > mid) {
        ch |= 1 << (4 - bit);
        minLat = mid;
      } else {
        maxLat = mid;
      }
    }
    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      hash += chars[ch];
      bit = 0;
      ch = 0;
    }
  }
  return hash;
}
