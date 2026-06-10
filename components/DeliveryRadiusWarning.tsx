"use client";

import { AlertTriangle, Truck, Clock } from "lucide-react";
import type { DeliveryZoneInfo } from "@/lib/locationUtils";

interface DeliveryRadiusWarningProps {
  zone: DeliveryZoneInfo;
  symbol: string;
  thirdPartyCharge: number;
}

export default function DeliveryRadiusWarning({
  zone,
  symbol,
  thirdPartyCharge,
}: DeliveryRadiusWarningProps) {
  if (zone.deliveryType === "own") return null;

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-6 flex items-start gap-3">
      <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-semibold text-amber-800 flex items-center gap-2">
          Extended Delivery Zone
        </h3>
        <p className="text-amber-700 text-sm mt-1">
          You are <span className="font-bold">{zone.distanceKm} km</span> away.
          Delivery will be handled by a third-party partner.
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-amber-600">
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> Additional charge:{" "}
            <span className="font-bold">{symbol}{thirdPartyCharge}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Est. delivery:{" "}
            <span className="font-bold">
              {zone.estimatedHours <= 24
                ? `${zone.estimatedHours} hrs`
                : `${Math.ceil(zone.estimatedHours / 24)} days`}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
