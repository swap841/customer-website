"use client";

import { useState, useCallback } from "react";
import {
  MapPin,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { getGeoHash, getDeliveryZoneInfo, type DeliveryZoneInfo } from "@/lib/locationUtils";
import { getDistanceKm } from "@/utils/distance";

interface LocationPickerProps {
  onLocationSelected: (location: {
    lat: number;
    lng: number;
    geoHash: string;
    zone: DeliveryZoneInfo;
  }) => void;
  disabled?: boolean;
  storeLat?: number;
  storeLng?: number;
}

export default function LocationPicker({
  onLocationSelected,
  disabled,
  storeLat = 17.6868,
  storeLng = 74.0066,
}: LocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");

  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const geoHash = getGeoHash(lat, lng);
        const zone = await getDeliveryZoneInfo(lat, lng);
        setIsLoading(false);
        toast.success(`Location detected — ${zone.distanceKm} km from store`);
        onLocationSelected({ lat, lng, geoHash, zone });
      },
      (err) => {
        setIsLoading(false);
        if (err.code === 1) {
          toast.error("Location permission denied. Please enable it in your browser settings or enter manually.");
        } else {
          toast.error("Could not detect your location. Please try again or enter manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [onLocationSelected]);

  const handleManualSubmit = useCallback(async () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error("Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180.");
      return;
    }
    const geoHash = getGeoHash(lat, lng);
    const zone = await getDeliveryZoneInfo(lat, lng);
    onLocationSelected({ lat, lng, geoHash, zone });
    toast.success(`Location set — ${zone.distanceKm} km from store`);
  }, [latInput, lngInput, onLocationSelected]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> Delivery Location
        </h3>
        <button
          type="button"
          onClick={() => setManualMode(!manualMode)}
          className="text-[11px] text-emerald-600 font-semibold hover:underline"
        >
          {manualMode ? "Use GPS instead" : "Enter manually"}
        </button>
      </div>

      {!manualMode ? (
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={disabled || isLoading}
          className="w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-4 flex items-center justify-center gap-2.5 text-sm font-semibold text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-600 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Detecting your location...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" /> Use my current location
            </>
          )}
        </button>
      ) : (
        <div className="rounded-xl border border-gray-200 p-3 bg-gray-50/50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                placeholder="e.g. 17.6868"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={lngInput}
                onChange={(e) => setLngInput(e.target.value)}
                placeholder="e.g. 74.0066"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleManualSubmit}
            disabled={disabled || !latInput || !lngInput}
            className="w-full rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            Set Location
          </button>
        </div>
      )}
    </div>
  );
}
