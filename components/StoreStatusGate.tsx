"use client";

import type { ReactNode } from "react";
import { useAppConfig } from "@/hooks/useAppConfig";
import { Store, Construction, Ban } from "lucide-react";

interface StoreStatusGateProps {
  children: ReactNode;
}

export default function StoreStatusGate({ children }: StoreStatusGateProps) {
  const { data: config, isLoading } = useAppConfig();

  if (isLoading) {
    return <>{children}</>;
  }

  const store = config?.store;
  const features = config?.features;

  const maintenanceMode = features?.maintenanceMode === true;
  const isStoreOpen = store?.isOpen !== false;

  if (maintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-white p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Construction className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Under Maintenance</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            We&apos;re currently performing some upgrades. We&apos;ll be back shortly!
          </p>
        </div>
      </div>
    );
  }

  if (!isStoreOpen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <Ban className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Store Closed</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            {store?.closedMessage || "The store is currently closed. Please check back during business hours."}
          </p>
          {store?.nextOpenTime && (
            <p className="mt-4 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-xl px-4 py-2 inline-block">
              Opens at {store.nextOpenTime}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
