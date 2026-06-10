"use client";

import { useState, useCallback, useRef } from "react";
import { MapPin, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { validatePincode, type PincodeValidation } from "@/lib/locationUtils";

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
  const [pincodeResult, setPincodeResult] = useState<PincodeValidation | null>(null);
  const [isValidatingPincode, setIsValidatingPincode] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const extractPincode = useCallback((text: string) => {
    const match = text.match(/\b\d{6}\b/);
    return match ? match[0] : "";
  }, []);

  const validateDetectedPincode = useCallback(
    async (pincode: string) => {
      if (!/^\d{6}$/.test(pincode)) {
        setPincodeResult(null);
        onPincodeValidated({ valid: false, error: "Enter a 6-digit pincode in your address" });
        return;
      }
      setIsValidatingPincode(true);
      try {
        const result = await validatePincode(pincode);
        setPincodeResult(result);
        onPincodeValidated({ valid: result.valid, error: result.error });
      } catch {
        setPincodeResult(null);
        onPincodeValidated({ valid: false, error: "Could not verify pincode" });
      } finally {
        setIsValidatingPincode(false);
      }
    },
    [onPincodeValidated]
  );

  const handleAddressChange = useCallback(
    (val: string) => {
      onAddressChange(val);
      setPincodeResult(null);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      const pin = val.match(/\b\d{6}\b/)?.[0] || "";
      if (pin.length === 6) {
        debounceRef.current = setTimeout(() => validateDetectedPincode(pin), 500);
      } else if (pin.length > 0) {
        onPincodeValidated({ valid: false, error: "Enter a 6-digit pincode" });
      } else {
        onPincodeValidated({ valid: false, error: "" });
      }
    },
    [onAddressChange, onPincodeValidated, validateDetectedPincode]
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
      {isValidatingPincode && (
        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Verifying pincode...
        </p>
      )}
      {!isValidatingPincode && pincodeResult && (
        <div className="mt-1">
          {pincodeResult.valid ? (
            <p className="text-[10px] text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {pincodeResult.area && `${pincodeResult.area}, `}
              {pincodeResult.city && `${pincodeResult.city}, `}
              {pincodeResult.state}
            </p>
          ) : (
            <p className="text-[10px] text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {pincodeResult.error || "Invalid pincode — no such pincode exists in India"}
            </p>
          )}
        </div>
      )}
      {!isValidatingPincode && !pincodeResult && address && address.length > 10 && !address.match(/\b\d{6}\b/) && (
        <p className="text-[10px] text-amber-500 mt-1">
          Include 6-digit pincode in your address (e.g. "123 Main St, Satara 415001")
        </p>
      )}
    </div>
  );
}
