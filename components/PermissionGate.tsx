"use client";
import { useState, useEffect } from "react";
import { Bell, MapPin, X, CheckCircle2 } from "lucide-react";

interface Props {
  onClose?: () => void;
}

export default function PermissionGate({ onClose }: Props) {
  const [notifSupported, setNotifSupported] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const [locSupported, setLocSupported] = useState(false);
  const [locGranted, setLocGranted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setNotifSupported(typeof Notification !== "undefined");
    setNotifGranted(Notification?.permission === "granted");
    setLocSupported("geolocation" in navigator);
    if ("geolocation" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then(r => {
        setLocGranted(r.state === "granted");
      }).catch(() => {});
    }
  }, []);

  const requestNotif = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setNotifGranted(result === "granted");
    if (result !== "granted") {
      setNotifGranted(false);
    }
  };

  const requestLoc = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocGranted(true);
        setTimeout(() => window.location.reload(), 500);
      },
      () => {}
    );
  };

  if (dismissed) return null;

  const allDone = notifGranted && locGranted;
  if (allDone) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <p className="text-xs text-emerald-700">All permissions granted. You&apos;re all set!</p>
        <button onClick={() => setDismissed(true)} className="ml-auto"><X className="w-4 h-4 text-emerald-500" /></button>
      </div>
    );
  }

  const anySupported = notifSupported || locSupported;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 relative">
      <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 p-0.5 rounded hover:bg-amber-100">
        <X className="w-4 h-4 text-amber-400" />
      </button>
      <p className="text-xs font-semibold text-amber-800 mb-3 pr-6">Enable optional features for a better experience:</p>
      <div className="flex flex-wrap gap-3">
        {locSupported && !locGranted && (
          <button onClick={requestLoc} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-amber-700 hover:bg-amber-100 transition font-medium">
            <MapPin className="w-3.5 h-3.5" /> Enable Location
          </button>
        )}
        {notifSupported && !notifGranted && (
          <button onClick={requestNotif} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-amber-700 hover:bg-amber-100 transition font-medium">
            <Bell className="w-3.5 h-3.5" /> Enable Notifications
          </button>
        )}
        {!anySupported && (
          <p className="text-xs text-amber-600">Permissions not supported in this browser.</p>
        )}
      </div>
    </div>
  );
}
