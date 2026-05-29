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
  tagline: "Fresh Grocery Express",
  copyrightText: "All rights reserved.",
  heroTitle: "Fresh groceries, delivered in 24 hours",
  heroSubtitle: "Farm-fresh produce, dairy, snacks and daily essentials – straight to your door.",
  aboutText: "",
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
