"use client";

import { useState, useCallback } from "react";
import { MapPin, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { validatePincode, type PincodeValidation } from "@/lib/locationUtils";

interface AddressVerificationProps {
  address: string;
  onAddressChange: (address: string) => void;
  pincode: string;
  onPincodeValidated: (validation: PincodeValidation) => void;
  disabled?: boolean;
}

export default function AddressVerification({
  address,
  onAddressChange,
  pincode,
  onPincodeValidated,
  disabled,
}: AddressVerificationProps) {
  const [isValidatingPincode, setIsValidatingPincode] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<PincodeValidation | null>(null);
  const [pincodeInput, setPincodeInput] = useState(pincode);

  const handlePincodeBlur = useCallback(async () => {
    const val = pincodeInput.trim();
    if (!/^\d{6}$/.test(val)) {
      setPincodeResult(null);
      return;
    }
    setIsValidatingPincode(true);
    try {
      const result = await validatePincode(val);
      setPincodeResult(result);
      onPincodeValidated(result);
      if (!result.valid) {
        toast.error(`Invalid pincode: ${result.error}`);
      }
    } catch {
      setPincodeResult(null);
    } finally {
      setIsValidatingPincode(false);
    }
  }, [pincodeInput, onPincodeValidated]);

  const handlePincodeChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    setPincodeInput(cleaned);
    setPincodeResult(null);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          Delivery Address *
        </label>
        <textarea
          className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/50 outline-none text-gray-800 resize-none text-sm leading-relaxed focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
          placeholder="Enter your complete delivery address with landmarks..."
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          Pincode *
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={pincodeInput}
            onChange={(e) => handlePincodeChange(e.target.value)}
            onBlur={handlePincodeBlur}
            placeholder="6-digit pincode"
            disabled={disabled}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/50 outline-none text-gray-800 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all disabled:opacity-50"
          />
          {isValidatingPincode && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
          {pincodeResult && !isValidatingPincode && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {pincodeResult.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
          )}
        </div>
        {pincodeResult && (
          <div className="mt-1.5">
            {pincodeResult.valid ? (
              <p className="text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {pincodeResult.area && `${pincodeResult.area}, `}
                {pincodeResult.city && `${pincodeResult.city}, `}
                {pincodeResult.state}
              </p>
            ) : (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {pincodeResult.error || "Invalid pincode"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
