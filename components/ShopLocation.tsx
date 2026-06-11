"use client";

import { MapPin, Clock, Phone, Mail, Navigation, ExternalLink } from "lucide-react";
import { useContactInfo } from "@/hooks/useContactInfo";

export default function ShopLocation() {
  const { contactInfo } = useContactInfo();

  const hasCoords = contactInfo.warehouseLat && contactInfo.warehouseLng;

  const openInGoogleMaps = () => {
    const url = hasCoords
      ? `https://www.google.com/maps/search/?api=1&query=${contactInfo.warehouseLat},${contactInfo.warehouseLng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address || "")}`;
    window.open(url, "_blank");
  };

  const getDirections = () => {
    if (navigator.geolocation && hasCoords) {
      navigator.geolocation.getCurrentPosition((position) => {
        const url = `https://www.google.com/maps/dir/${position.coords.latitude},${position.coords.longitude}/${contactInfo.warehouseLat},${contactInfo.warehouseLng}`;
        window.open(url, "_blank");
      }, () => openInGoogleMaps());
    } else {
      openInGoogleMaps();
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 p-6 space-y-4">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <MapPin className="w-5 h-5 text-emerald-600" />
        Shop Location
      </h3>

      <div className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-zinc-400">{contactInfo.address}</p>

        {hasCoords && (
          <div
            onClick={openInGoogleMaps}
            className="relative h-48 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl overflow-hidden cursor-pointer group border border-emerald-200/50 dark:border-emerald-800/50"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <MapPin className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-2" />
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                {contactInfo.warehouseLat?.toFixed(4)}, {contactInfo.warehouseLng?.toFixed(4)}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Tap to open in Google Maps</p>
            </div>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <span className="bg-white dark:bg-zinc-800 px-4 py-2 rounded-full text-sm font-semibold">Open in Maps</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={openInGoogleMaps}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition"
          >
            <MapPin className="w-4 h-4" />
            View on Map
          </button>
          <button
            onClick={getDirections}
            className="flex items-center gap-2 px-4 py-2 border border-emerald-600 text-emerald-600 rounded-xl text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950 transition"
          >
            <Navigation className="w-4 h-4" />
            Get Directions
          </button>
        </div>
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex flex-wrap gap-2">
        <a
          href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
        >
          <Phone className="w-3.5 h-3.5" /> Call
        </a>
        <a
          href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g, "")}`}
          target="_blank"
          className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium hover:bg-green-200 dark:hover:bg-green-800/40 transition"
        >
          WhatsApp
        </a>
        <a
          href={`mailto:${contactInfo.email}`}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg text-xs font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
        >
          <Mail className="w-3.5 h-3.5" /> Email
        </a>
      </div>
    </div>
  );
}