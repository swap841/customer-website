import { getDistanceKm } from "./distance";

export function getAreaCode(lat: number, lng: number): string {
  const R = 6371;
  const dLat = ((lat - 17.6868) * Math.PI) / 180;
  const dLng = ((lng - 74.0066) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((17.6868 * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;

  if (dist <= 20) return `AREA_LOCAL_${Math.round(dist)}`;
  return "OUT_OF_CITY";
}

export function getAreaCodeFromAddress(address: string): string {
  if (!address) return "AREA_UNKNOWN";
  const pincodeMatch = address.match(/\b\d{6}\b/);
  if (pincodeMatch) {
    return `AREA_${pincodeMatch[0]}`;
  }
  return "AREA_UNKNOWN";
}