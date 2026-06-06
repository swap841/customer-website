"use client";

import { useState } from "react";
import { MapPin, Home, Briefcase, MoreHorizontal, Trash2, Plus, Check, ChevronRight } from "lucide-react";

interface AddressHistoryProps {
  onSelect: (address: string, lat?: number, lng?: number, label?: string) => void;
  savedAddresses: Array<{
    id: string;
    address: string;
    lat?: number;
    lng?: number;
    label?: string;
    landmark?: string;
  }>;
  onDelete?: (id: string) => void;
  selectedAddress?: string;
}

const LABEL_ICONS: Record<string, typeof Home> = {
  Home: Home,
  Work: Briefcase,
  Other: MoreHorizontal,
};

const LABEL_COLORS: Record<string, string> = {
  Home: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Work: "bg-blue-50 text-blue-600 border-blue-200",
  Other: "bg-purple-50 text-purple-600 border-purple-200",
};

const LABEL_ACTIVE_COLORS: Record<string, string> = {
  Home: "bg-emerald-500 text-white",
  Work: "bg-blue-500 text-white",
  Other: "bg-purple-500 text-white",
};

export default function AddressHistory({
  onSelect,
  savedAddresses,
  onDelete,
  selectedAddress,
}: AddressHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (savedAddresses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center bg-gray-50/50">
        <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500 font-medium">No saved addresses yet</p>
        <p className="text-xs text-gray-400 mt-1">Your delivery addresses will appear here</p>
      </div>
    );
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deletingId) return;
    setDeletingId(id);
    setTimeout(() => {
      onDelete?.(id);
      setDeletingId(null);
    }, 300);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
        Saved Addresses
      </h3>
      <div className="space-y-2">
        {savedAddresses.map((addr) => {
          const label = addr.label || "Home";
          const Icon = LABEL_ICONS[label] || MoreHorizontal;
          const isActive = selectedAddress === addr.address;
          const isDeleting = deletingId === addr.id;

          return (
            <div
              key={addr.id}
              onClick={() => onSelect(addr.address, addr.lat, addr.lng, label)}
              className={`
                group relative rounded-xl border-2 p-3.5 cursor-pointer transition-all duration-200
                ${isActive
                  ? "border-emerald-500 bg-emerald-50/80 shadow-md shadow-emerald-100"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }
                ${isDeleting ? "opacity-50 scale-95" : ""}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors
                  ${isActive ? LABEL_ACTIVE_COLORS[label] || LABEL_ACTIVE_COLORS.Home : LABEL_COLORS[label] || LABEL_COLORS.Home}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      isActive ? "bg-emerald-500/10 text-emerald-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {label}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                        <Check className="w-3 h-3" /> Delivering here
                      </span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed mt-1 ${isActive ? "text-gray-800 font-medium" : "text-gray-600"}`}>
                    {addr.address}
                  </p>
                  {addr.landmark && (
                    <p className="text-xs text-gray-400 mt-0.5">Near {addr.landmark}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {onDelete && (
                    <button
                      onClick={(e) => handleDelete(e, addr.id)}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <ChevronRight className={`w-4 h-4 transition-colors ${isActive ? "text-emerald-500" : "text-gray-300"}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
