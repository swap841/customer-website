"use client";

import { MapPin, Clock, Check } from "lucide-react";

interface AddressHistoryProps {
  onSelect: (address: string) => void;
  savedAddresses: string[];
}

export default function AddressHistory({
  onSelect,
  savedAddresses,
}: AddressHistoryProps) {
  if (savedAddresses.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 mb-2">
        <Clock className="w-3.5 h-3.5" />
        Saved Addresses
      </h3>
      <div className="space-y-2">
        {savedAddresses.map((addr, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-200 dark:border-gray-600"
          >
            <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">
              {addr}
            </p>
            <button
              onClick={() => onSelect(addr)}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              <Check className="w-3 h-3" />
              Use this
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
