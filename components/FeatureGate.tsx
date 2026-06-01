"use client";

import type { ReactNode } from "react";
import { useAppConfig } from "@/hooks/useAppConfig";

interface FeatureGateProps {
  feature: string;
  fallback?: ReactNode;
  children: ReactNode;
}

export function FeatureGate({ feature, fallback = null, children }: FeatureGateProps) {
  const { data: config } = useAppConfig();

  const enabled = config?.features?.[feature] === true;

  if (!enabled) return <>{fallback}</>;

  return <>{children}</>;
}
