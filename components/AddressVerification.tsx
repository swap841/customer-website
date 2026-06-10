"use client";

import { useState, useCallback } from "react";
import { MapPin } from "lucide-react";

interface AddressVerificationProps {
  address: string;
  onAddressChange: (address: string) => void;
  onPincodeValidated: (validation: { valid: boolean; error?: string }) => void;
  disabled?: boolean;
}

export default function AddressVerification({
  address,
  onAddressChange,
  onPincodeValidated,
  disabled,
}: AddressVerificationProps) {
  const extractPincode = useCallback((text: string) => {
    const match = text.match(/\b\d{6}\b/);
    return match ? match[0] : "";
  }, []);

  const handleAddressChange = useCallback(
    (val: string) => {
      onAddressChange(val);
      const pin = extractPincode(val);
      if (pin.length === 6) {
        onPincodeValidated({ valid: true });
      } else {
        onPincodeValidated({ valid: false, error: "Enter a 6-digit pincode in your address" });
      }
    },
    [extractPincode, onAddressChange, onPincodeValidated]
  );

  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
        Delivery Address *
      </label>
      <textarea
        className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/50 outline-none text-gray-800 resize-none text-sm leading-relaxed focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
        placeholder="House/Flat, Street, Area, City, State - 123456 (include 6-digit pincode)"
        value={address}
        onChange={(e) => handleAddressChange(e.target.value)}
        rows={3}
        disabled={disabled}
        required
      />
      {address && address.match(/\b\d{6}\b/) ? (
        <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Pincode {address.match(/\b\d{6}\b/)?.[0]} detected
        </p>
      ) : address.length > 10 ? (
        <p className="text-[10px] text-amber-500 mt-1">
          Include 6-digit pincode in your address (e.g. "123 Main St, Satara 415001")
        </p>
      ) : null}
    </div>
  );
}
