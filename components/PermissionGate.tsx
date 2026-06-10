"use client";
import { useState, useEffect } from "react";
import { X, MapPin, Bell, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface PermissionStatus {
  location: PermissionState | "unsupported";
  notification: "granted" | "denied" | "prompt" | "default" | "unsupported";
}

interface Props {
  onGranted: () => void;
  onClose?: () => void;
}

export default function PermissionGate({ onGranted, onClose }: Props) {
  const [status, setStatus] = useState<PermissionStatus>({ location: "prompt", notification: "prompt" });
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requesting, setRequesting] = useState<"location" | "notification" | null>(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    setChecking(true);
    const loc = typeof navigator !== "undefined" && "permissions" in navigator
      ? await navigator.permissions.query({ name: "geolocation" }).then(r => r.state).catch(() => "prompt" as PermissionState)
      : "unsupported" as PermissionState;
    const notif: PermissionStatus["notification"] = typeof Notification !== "undefined" ? Notification.permission as unknown as PermissionState : "unsupported";
    setStatus({ location: loc, notification: notif });
    setChecking(false);
    if (loc === "granted" && (notif === "granted" || notif === "unsupported")) {
      onGranted();
    }
  };

  const requestLocation = async () => {
    setRequesting("location");
    setError(null);
    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000 });
      });
      setStatus(prev => ({ ...prev, location: "granted" }));
      setError(null);
      setRequesting(null);
      checkPermissions();
    } catch {
      setError("Location access denied. Please enable location in your browser settings to place orders.");
      setStatus(prev => ({ ...prev, location: "denied" }));
      setRequesting(null);
    }
  };

  const requestNotification = async () => {
    setRequesting("notification");
    setError(null);
    try {
      const result = await Notification.requestPermission();
      setStatus(prev => ({ ...prev, notification: result }));
      setError(null);
      setRequesting(null);
      if (result === "granted") {
        checkPermissions();
      } else {
        setError("Notification permission denied. You won't receive OTP codes for order verification.");
      }
    } catch {
      setError("Could not request notification permission. Please check browser settings.");
      setRequesting(null);
    }
  };

  if (checking) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  const allGranted = status.location === "granted" && (status.notification === "granted" || status.notification === "unsupported");

  if (allGranted) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative">
        {/* X Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-5">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-gray-900">Permissions Required</h2>
          <p className="text-sm text-gray-500 mt-1">We need these to deliver your order</p>
        </div>

        <div className="space-y-3 mb-5">
          {/* Location */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${status.location === "granted" ? "border-emerald-200 bg-emerald-50" : "border-gray-200"}`}>
            <MapPin className={`w-5 h-5 ${status.location === "granted" ? "text-emerald-600" : "text-gray-400"}`} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Location Access</p>
              <p className="text-xs text-gray-500">Required for delivery address</p>
            </div>
            {status.location === "granted" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <button
                onClick={requestLocation}
                disabled={requesting === "location"}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
              >
                {requesting === "location" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enable"}
              </button>
            )}
          </div>

          {/* Notification */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${status.notification === "granted" ? "border-emerald-200 bg-emerald-50" : status.notification === "denied" ? "border-red-200 bg-red-50" : "border-gray-200"}`}>
            <Bell className={`w-5 h-5 ${status.notification === "granted" ? "text-emerald-600" : status.notification === "denied" ? "text-red-400" : "text-gray-400"}`} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Notifications</p>
              <p className="text-xs text-gray-500">OTP code for order verification</p>
              {status.notification === "denied" && (
                <p className="text-[10px] text-red-500 mt-0.5">Previously blocked — enable in browser settings</p>
              )}
            </div>
            {status.notification === "granted" || status.notification === "unsupported" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : status.notification === "denied" ? (
              <button
                onClick={() => setError("Notifications were blocked. Click the lock icon in your address bar → Notifications → Allow, then refresh the page.")}
                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold"
              >
                Blocked
              </button>
            ) : (
              <button
                onClick={requestNotification}
                disabled={requesting === "notification"}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
              >
                {requesting === "notification" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enable"}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={checkPermissions}
          disabled={status.location !== "granted"}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status.location === "granted" ? "Continue to Checkout" : "Enable Location to Continue"}
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Location is required for delivery. You can change this anytime in browser settings.
        </p>
      </div>
    </div>
  );
}
