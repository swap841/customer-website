"use client";

import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import type { ContactInfo } from "@/shared/models";

const DEFAULT_CONTACT_INFO: ContactInfo = {
  phone: "+91 98765 43210",
  email: "support@mystoregrocery.in",
  address: "102, Emerald Heights, Business Park, Andheri East, Mumbai - 400069",
  deliveryRadiusKm: 20,
  logoUrl: "",
  warehouseLat: 17.6868,
  warehouseLng: 74.0066,
  storeName: "My Store Grocery",
  taxPercentage: 5,
  deliveryFeePerKm: 5,
  freeDeliveryAbove: 100,
  tagline: "Premium Quality, Delivered Fresh",
  copyrightText: "All rights reserved.",
  heroTitle: "Quality products, delivered fast",
  heroSubtitle: "Premium selections, daily essentials and must-have items – straight to your door.",
  aboutText: "",
  socialMedia: {},
  currencySymbol: "\u20B9",
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
};

export function useContactInfo() {
  const { data: contactInfo, isLoading } = useQuery({
    queryKey: ["contactInfo"],
    queryFn: async () => {
      const ref = doc(db, "contactInfo", "info");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return { ...DEFAULT_CONTACT_INFO, ...snap.data() } as ContactInfo;
      }
      return DEFAULT_CONTACT_INFO;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return { contactInfo: contactInfo ?? DEFAULT_CONTACT_INFO, loading: isLoading };
}
