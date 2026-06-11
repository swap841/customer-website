export interface StoreConfig {
  storeName: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  deliveryRadiusKm: number;
  deliveryChargePerKm: number;
  freeDeliveryAbove: number;
  taxPercentage: number;
  workingHours: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    youtube?: string;
  };
  aboutText: string;
  deliveryTimeText: string;
  outOfCityText: string;
  storeLat: number;
  storeLng: number;
  maxBasketWeightKg: number;
  deliverySpeedKmph: number;
  trafficMultiplier: number;
  handlingTimeHours: number;
  currencySymbol: string;
  storeLogo: string;
  storeFavicon: string;
  primaryColor: string;
  accentColor: string;
  maintenanceMode: boolean;
  isOpen: boolean;
  minOrderValue: number;
}

export const defaultConfig: StoreConfig = {
  storeName: "My Store Grocery",
  storePhone: "+91 98765 43210",
  storeEmail: "support@mystoregrocery.in",
  storeAddress: "102, Emerald Heights, Business Park, Andheri East, Mumbai - 400069",
  deliveryRadiusKm: 20,
  deliveryChargePerKm: 5,
  freeDeliveryAbove: 100,
  taxPercentage: 5,
  workingHours: "9:00 AM - 9:00 PM",
  socialMedia: {
    facebook: "",
    instagram: "",
    whatsapp: "",
    youtube: "",
  },
  aboutText: "We are your trusted partner for fresh groceries delivered to your doorstep. Our mission is to make quality products accessible to everyone with fast, reliable delivery.",
  deliveryTimeText: "Delivered in 24 hours",
  outOfCityText: "We deliver up to 50km. Additional charges apply beyond 20km.",
  storeLat: 17.6868,
  storeLng: 74.0066,
  maxBasketWeightKg: 15,
  deliverySpeedKmph: 25,
  trafficMultiplier: 1.5,
  handlingTimeHours: 1,
  currencySymbol: "\u20B9",
  storeLogo: "/icon.png",
  storeFavicon: "/favicon.ico",
  primaryColor: "#059669",
  accentColor: "#0d9488",
  maintenanceMode: false,
  isOpen: true,
  minOrderValue: 0,
};

export function mergeConfig(remote: Partial<StoreConfig>): StoreConfig {
  return { ...defaultConfig, ...remote };
}