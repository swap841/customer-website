"use client";

import { useQuery } from "@tanstack/react-query";
import { getAppConfig, type AppConfig } from "@/lib/appConfig";

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  deliveryRadiusKm: number;
  logoUrl: string;
  warehouseLat: number;
  warehouseLng: number;
  storeName: string;
  taxPercentage: number;
  deliveryFeePerKm: number;
  freeDeliveryAbove: number;
  tagline: string;
  copyrightText: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  socialMedia: Record<string, string>;
  currencySymbol: string;
  heroBadgeText: string;
  heroCtaText: string;
  heroSecondaryCtaText: string;
  categorySectionTitle: string;
  categorySectionViewAll: string;
  trendingSectionLabel: string;
  trendingSectionTitle: string;
  trendingSectionBrowseAll: string;
  freeDeliveryTitle: string;
  freeDeliveryDescription: string;
  freeDeliveryAddMore: string;
  freeDeliveryCtaText: string;
  orderPromptLabel: string;
  orderPromptTitle: string;
  orderPromptCtaText: string;
  defaultBannerEmojis: string;
  defaultBannerTagline: string;
  pickupHours: string;
  footerShopTitle: string;
  footerCompanyTitle: string;
  footerLegalTitle: string;
  contactHelpcenterTitle: string;
  contactCallHelpdeskTitle: string;
  contactEmailUsTitle: string;
  contactAddressTitle: string;
  aboutPageTitle: string;
  aboutPageSubtitle: string;
  aboutStoryTitle: string;
  aboutMissionTitle: string;
  aboutVisionTitle: string;
  aboutAchievementsTitle: string;
  profileCurrentOrders: string;
  profilePastOrders: string;
  thirdPartyDeliveryCharge: number;
  workingHours: string;
  responseTime: string;
}

function configToContactInfo(cfg: AppConfig): ContactInfo {
  const b = cfg.business || {};
  const s = cfg.store || {};
  const c = cfg.contact || {};
  const loc = s.location || {};
  return {
    phone: c.phone || "+91 98765 43210",
    email: c.email || "support@mystoregrocery.in",
    address: c.address || "",
    deliveryRadiusKm: 20,
    logoUrl: b.logoUrl || "",
    warehouseLat: loc.lat ?? 17.6868,
    warehouseLng: loc.lng ?? 74.0066,
    storeName: b.name || "My Store Grocery",
    taxPercentage: s.taxPercent ?? b.taxRate ?? 5,
    deliveryFeePerKm: s.deliveryCharge ?? 5,
    freeDeliveryAbove: s.freeDeliveryAbove ?? 100,
    tagline: "Premium Quality, Delivered Fresh",
    copyrightText: "All rights reserved.",
    heroTitle: "Quality products, delivered fast",
    heroSubtitle: "Premium selections, daily essentials and must-have items – straight to your door.",
    aboutText: "",
    socialMedia: {},
    currencySymbol: b.currencySymbol || "\u20B9",
    heroBadgeText: "",
    heroCtaText: "Start shopping",
    heroSecondaryCtaText: "Explore categories",
    categorySectionTitle: "Shop by category",
    categorySectionViewAll: "View all",
    trendingSectionLabel: "Today\u2019s best",
    trendingSectionTitle: "Popular picks for you",
    trendingSectionBrowseAll: "Browse all",
    freeDeliveryTitle: "Free delivery",
    freeDeliveryDescription: "Get free delivery on orders above {symbol}{amount}",
    freeDeliveryAddMore: "Add {symbol}{amount} more for free delivery",
    freeDeliveryCtaText: "Start shopping",
    orderPromptLabel: "Start your order",
    orderPromptTitle: "Your items await",
    orderPromptCtaText: "Shop now",
    defaultBannerEmojis: "",
    defaultBannerTagline: "Premium products delivered fresh.",
    pickupHours: "9:00 AM - 9:00 PM",
    footerShopTitle: "Shop",
    footerCompanyTitle: "Company",
    footerLegalTitle: "Legal",
    contactHelpcenterTitle: "Help Center",
    contactCallHelpdeskTitle: "Call Helpdesk",
    contactEmailUsTitle: "Email Us",
    contactAddressTitle: "Our Location",
    aboutPageTitle: "About Us",
    aboutPageSubtitle: "Your trusted partner since",
    aboutStoryTitle: "Our Story",
    aboutMissionTitle: "Our Mission",
    aboutVisionTitle: "Our Vision",
    aboutAchievementsTitle: "Achievements",
    profileCurrentOrders: "Current Orders",
    profilePastOrders: "Past Orders",
    thirdPartyDeliveryCharge: 25,
    workingHours: "9:00 AM - 9:00 PM",
    responseTime: "Average response time: 4 hours",
  };
}

const DEFAULT_CONTACT_INFO: ContactInfo = configToContactInfo({});

export function useContactInfo() {
  const { data: contactInfo, isLoading } = useQuery({
    queryKey: ["contactInfo"],
    queryFn: async () => {
      const cfg = await getAppConfig(true);
      return configToContactInfo(cfg);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return { contactInfo: contactInfo ?? DEFAULT_CONTACT_INFO, loading: isLoading };
}
