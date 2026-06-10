"use client";
import { MapPin, Check, Trash2 } from "lucide-react";

interface Props {
  address: { address: string; lat: number | null; lng: number | null; label: string; pincode: string } | null;
  onUseAddress: () => void;
  onClearAddress: () => void;
}

export default function SavedAddress({ address, onUseAddress, onClearAddress }: Props) {
  if (!address) return null;

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Saved Address</p>
            <p className="text-sm font-semibold text-gray-800">{address.address}</p>
            <p className="text-xs text-gray-500 mt-0.5">{address.label}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onUseAddress}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
          >
            <Check className="w-3 h-3" /> Use
          </button>
          <button
            onClick={onClearAddress}
            className="p-1.5 text-gray-400 hover:text-red-500 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
