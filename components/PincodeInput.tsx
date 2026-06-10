"use client";

import { useState, useCallback } from "react";
import {
  MapPin,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  validatePincode,
  isPincodeLocal,
  type PincodeValidation,
} from "@/lib/locationUtils";
import { getAppConfig, type AppConfig } from "@/lib/appConfig";

interface PincodeInputProps {
  pincode: string;
  onPincodeValidated: (
    validation: PincodeValidation,
    isLocal: boolean,
    config: AppConfig
  ) => void;
  disabled?: boolean;
}

export default function PincodeInput({
  pincode,
  onPincodeValidated,
  disabled,
}: PincodeInputProps) {
  const [input, setInput] = useState(pincode);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<PincodeValidation | null>(null);

  const handleValidate = useCallback(async () => {
    const val = input.trim();
    if (!/^\d{6}$/.test(val)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
    setIsValidating(true);
    try {
      const [validation, config] = await Promise.all([
        validatePincode(val),
        getAppConfig(true),
      ]);
      setResult(validation);
      const local = isPincodeLocal(val, config);
      onPincodeValidated(validation, local, config);
      if (!validation.valid) {
        toast.error(`Invalid pincode: ${validation.error}`);
      }
    } catch {
      toast.error("Failed to validate pincode");
    } finally {
      setIsValidating(false);
    }
  }, [input, onPincodeValidated]);

  const handleChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    setInput(cleaned);
    setResult(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
        <Package className="w-3.5 h-3.5 inline mr-1" />
        Check Delivery Availability
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleValidate()}
            placeholder="Enter 6-digit pincode"
            disabled={disabled}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50/50 outline-none text-gray-800 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all disabled:opacity-50"
          />
          {isValidating && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
          {result && !isValidating && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {result.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleValidate}
          disabled={disabled || isValidating || input.length !== 6}
          className="rounded-xl bg-emerald-600 text-white px-4 py-3 text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {isValidating ? "Checking..." : "Check"}
        </button>
      </div>
      {result && (
        <div className="mt-1">
          {result.valid ? (
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Delivery available — {result.area && `${result.area}, `}
              {result.city && `${result.city}, `}
              {result.state}
            </p>
          ) : (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {result.error || "Invalid pincode"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
