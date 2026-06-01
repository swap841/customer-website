export interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  discountPercentage?: number;
  imageUrl?: string;
  weight?: number;
  unit?: string;
  stock?: number;
  categoryId?: string;
  lowStockThreshold?: number;
  rating?: { average: number; count: number };
  active?: boolean;
  description?: string;
}

export interface Banner {
  id: string;
  active?: boolean;
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  link?: string;
  order?: number;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  active?: boolean;
  order?: number;
  imageUrl?: string;
}

export interface ContactInfo {
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
  privacyPolicy?: string;
  shippingPolicy?: string;
  refundPolicy?: string;
  termsAndConditions?: string;
  ownerFcmToken?: string;
  ownerPhone?: string;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  items: OrderItem[];
  totalAmount: number;
  payment: OrderPayment;
  shippingAddress: OrderAddress;
  createdAt: { toMillis(): number } | string;
  updatedAt?: { toMillis(): number } | string;
  deliveryBoyId?: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface OrderPayment {
  method: "cod" | "online";
  status: "pending" | "paid" | "refunded";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export interface OrderAddress {
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: { toMillis(): number } | string;
}
