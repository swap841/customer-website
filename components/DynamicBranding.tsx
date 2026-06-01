"use client";

import { useEffect } from "react";
import { useAppConfig } from "@/hooks/useAppConfig";

export default function DynamicBranding() {
  const { data: config } = useAppConfig();

  useEffect(() => {
    if (!config) return;

    const brand = config.branding;
    const seo = config.seo;

    document.title = seo?.metaTitle || brand?.storeName || "My Store";

    if (seo?.metaDescription) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", seo.metaDescription);
    }

    if (brand?.faviconUrl) {
      let favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }
      favicon.href = brand.faviconUrl;
    }

    if (brand?.primaryColor) {
      document.documentElement.style.setProperty("--primary", brand.primaryColor);
    }
  }, [config]);

  return null;
}
