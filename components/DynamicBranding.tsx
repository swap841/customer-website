"use client";
import React, { useEffect, useState } from "react";
import { getAppConfig, AppConfig } from "@/lib/appConfig";

export default function DynamicBranding({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>({});

  useEffect(() => {
    getAppConfig(true).then(setConfig).catch(() => {});
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (config.business?.primaryColor) {
      root.style.setProperty("--primary", config.business.primaryColor);
    }
    if (config.business?.accentColor) {
      root.style.setProperty("--accent", config.business.accentColor);
    }
    if (config.business?.font) {
      root.style.setProperty("--font-family", config.business.font);
    }
  }, [config]);

  useEffect(() => {
    if (config.business?.name) {
      document.title = config.business.name;
    }
    if (config.business?.faviconUrl) {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (link) link.href = config.business.faviconUrl;
    }
  }, [config.business?.name, config.business?.faviconUrl]);

  return <>{children}</>;
}
