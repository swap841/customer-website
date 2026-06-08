"use client";

import { useEffect } from "react";
import { getAppConfig } from "@/lib/appConfig";

export default function DynamicSEO() {
  useEffect(() => {
    let mounted = true;

    async function updateMeta() {
      try {
        const config = await getAppConfig();
        if (!mounted) return;

        const storeName = config.business?.name || "My Store";
        const description = config.seo?.metaDescription || "Fresh groceries delivered fast";
        const title = config.seo?.metaTitle || `${storeName} — Fresh Groceries Delivered Fast`;
        const keywords = config.seo?.metaKeywords || ["grocery", "delivery", "fresh produce", "online grocery", storeName];

        document.title = title;

        const updateTag = (name: string, content: string) => {
          let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
          if (!tag) {
            tag = document.createElement("meta");
            tag.name = name;
            document.head.appendChild(tag);
          }
          tag.content = content;
        };

        const updateOG = (property: string, content: string) => {
          let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
          if (!tag) {
            tag = document.createElement("meta");
            tag.setAttribute("property", property);
            document.head.appendChild(tag);
          }
          tag.content = content;
        };

        updateTag("description", description);
        updateTag("keywords", keywords.join(", "));
        updateOG("og:title", title);
        updateOG("og:description", description);
        updateOG("og:site_name", storeName);
      } catch {}
    }

    updateMeta();
    return () => { mounted = false; };
  }, []);

  return null;
}
