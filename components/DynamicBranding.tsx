"use client";
import React, { useEffect, useState } from "react";
import { getAppConfig, AppConfig } from "@/lib/appConfig";

export default function DynamicBranding({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>({});

  useEffect(() => {
    getAppConfig(true).then(setConfig).catch(() => {});
  }, []);

  useEffect(() => {
    if (config.business?.primaryColor) {
      document.documentElement.style.setProperty("--primary", config.business.primaryColor);
    }
    if (config.business?.accentColor) {
      document.documentElement.style.setProperty("--accent", config.business.accentColor);
    }
    if (config.business?.font) {
      document.documentElement.style.setProperty("--font-family", config.business.font);
    }
  }, [config]);

  return <>{children}</>;
}
