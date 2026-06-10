"use client";
import { X, MapPin, Bell, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  icon?: "location" | "notification";
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  granted?: boolean;
}

export default function PermissionDialog({
  isOpen, onClose, onConfirm, title, message, icon = "location",
  confirmText = "Enable", cancelText = "Not Now", loading = false, granted = false
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-4">
          {loading ? (
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-2" />
          ) : granted ? (
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          ) : icon === "location" ? (
            <MapPin className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          ) : (
            <Bell className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          )}
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        </div>

        <div className="flex gap-3">
          {!granted && (
            <button onClick={onClose} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold text-sm">
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={loading || granted}
            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm disabled:opacity-50"
          >
            {granted ? "Enabled" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
