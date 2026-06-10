"use client";
import { useState, useEffect } from "react";
import { MapPin, Bell, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface PermissionStatus {
  location: PermissionState | "unsupported";
  notification: "granted" | "denied" | "prompt" | "default" | "unsupported";
}

interface Props {
  onGranted: () => void;
}

export default function PermissionGate({ onGranted }: Props) {
  const [status, setStatus] = useState<PermissionStatus>({ location: "prompt", notification: "prompt" });
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
      });
      setStatus(prev => ({ ...prev, location: "granted" }));
      setError(null);
      checkPermissions();
    } catch {
      setError("Location access denied. Please enable location in your browser settings to place orders.");
      setStatus(prev => ({ ...prev, location: "denied" }));
    }
  };

  const requestNotification = async () => {
    try {
      const result = await Notification.requestPermission();
      setStatus(prev => ({ ...prev, notification: result }));
      setError(null);
      checkPermissions();
    } catch {
      setError("Notification permission denied. You won't receive order updates.");
      setStatus(prev => ({ ...prev, notification: "denied" }));
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
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="text-center mb-5">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-gray-900">Permissions Required</h2>
          <p className="text-sm text-gray-500 mt-1">We need these to deliver your order</p>
        </div>

        <div className="space-y-3 mb-5">
          <div className={`flex items-center gap-3 p-3 rounded-xl border ${status.location === "granted" ? "border-emerald-200 bg-emerald-50" : "border-gray-200"}`}>
            <MapPin className={`w-5 h-5 ${status.location === "granted" ? "text-emerald-600" : "text-gray-400"}`} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Location Access</p>
              <p className="text-xs text-gray-500">Required for delivery</p>
            </div>
            {status.location === "granted" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <button onClick={requestLocation} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">Enable</button>
            )}
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl border ${status.notification === "granted" ? "border-emerald-200 bg-emerald-50" : "border-gray-200"}`}>
            <Bell className={`w-5 h-5 ${status.notification === "granted" ? "text-emerald-600" : "text-gray-400"}`} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">Notifications</p>
              <p className="text-xs text-gray-500">Order updates &amp; delivery alerts</p>
            </div>
            {status.notification === "granted" || status.notification === "unsupported" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <button onClick={requestNotification} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold">Enable</button>
            )}
          </div>
        </div>

        {error && <p className="text-xs text-red-500 text-center mb-3">{error}</p>}

        <button
          onClick={checkPermissions}
          disabled={status.location !== "granted"}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status.location === "granted" ? "Continue to Checkout" : "Enable Location to Continue"}
        </button>
        <p className="text-[10px] text-gray-400 text-center mt-2">Location is required for delivery. You can change this anytime in browser settings.</p>
      </div>
    </div>
  );
}