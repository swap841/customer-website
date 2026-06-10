export interface DeliveryTimeEstimate {
  display: string;
  hours: number;
  isOutOfRadius: boolean;
  distanceKm: number;
}

export function calculateDeliveryTime(
  distanceKm: number,
  storeLat: number,
  storeLng: number,
  config?: {
    speedKmh?: number;
    handlingTimeHours?: number;
    trafficMultiplier?: number;
    outOfCityDays?: number;
    maxDeliveryRadiusKm?: number;
  }
): DeliveryTimeEstimate {
  const speed = config?.speedKmh || 40;
  const handling = config?.handlingTimeHours || 0.5;
  const traffic = config?.trafficMultiplier || 1.2;
  const outOfCityDays = config?.outOfCityDays || 7;
  const maxRadius = config?.maxDeliveryRadiusKm || 20;

  if (distanceKm > maxRadius) {
    return {
      display: `Out of city delivery - ${outOfCityDays}-${outOfCityDays + 1} working days`,
      hours: outOfCityDays * 24,
      isOutOfRadius: true,
      distanceKm,
    };
  }

  const travelHours = (distanceKm / speed) * traffic;
  const totalHours = travelHours + handling;

  let display: string;
  if (totalHours < 1) {
    display = "30-60 minutes";
  } else if (totalHours < 2) {
    display = "1-2 hours";
  } else if (totalHours < 3) {
    display = "2-3 hours";
  } else if (totalHours < 4) {
    display = "3-4 hours";
  } else {
    display = "4+ hours (same day delivery)";
  }

  return { display, hours: totalHours, isOutOfRadius: false, distanceKm };
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
