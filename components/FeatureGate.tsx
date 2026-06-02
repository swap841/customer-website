"use client";
import React, { useEffect, useState } from "react";
import { getAppConfig, isFeatureEnabled, AppConfig } from "@/lib/appConfig";

interface FeatureGateProps {
  feature: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export default function FeatureGate({ feature, fallback = null, children }: FeatureGateProps) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    getAppConfig().then((cfg) => setEnabled(isFeatureEnabled(cfg, feature))).catch(() => {});
  }, [feature]);

  if (!enabled) return <>{fallback}</>;
  return <>{children}</>;
}
