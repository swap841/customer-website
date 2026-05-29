export interface Rating {
  average: number;
  count: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  imageUrl?: string;
  description?: string;
  weight?: number;
  unit?: string;
  stock?: number;
  categoryId?: string;
  active?: boolean;
  rating?: Rating;
  lowStockThreshold?: number;
}

export interface Category {
  id: string;
  name: string;
  displayName?: string;
  imageUrl?: string;
  active?: boolean;
  order?: number;
  icon?: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  link: string;
  active: boolean;
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
  socialLinks?: Record<string, string>;
  privacyPolicy?: string;
  refundPolicy?: string;
  shippingPolicy?: string;
  termsAndConditions?: string;
  tagline?: string;
  copyrightText?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  aboutText?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  address: OrderAddress;
  status: OrderStatus;
  totalAmount: number;
  totalWeight: number;
  payment: OrderPayment;
  areaCode: string;
  assignedWorkerId?: string;
  assignedDeliveryBoyId?: string;
  assignedBasketId?: string;
  outOfCity: boolean;
  estimatedDeliveryDate?: string;
  verificationCode?: string;
  packedAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  couponApplied?: string;
  deliveryTimeSlot?: string;
  createdAt: string;
  rejectionHistory?: RejectionEntry[];
  ticketContactId?: string;
}

export interface RejectionEntry {
  rejectedBy: string;
  reason: string;
  at: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  weight?: number;
  imageUrl?: string;
}

export interface OrderAddress {
  name: string;
  phone: string;
  addressLine: string;
  pincode?: string;
  city?: string;
  lat?: number | null;
  lng?: number | null;
}

export interface OrderPayment {
  method: string;
  status: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

export type OrderStatus =
  | "Pending"
  | "Packing"
  | "Ready to Dispatch"
  | "Assigned"
  | "Accepted"
  | "Out for Delivery"
  | "Awaiting Verification"
  | "Delivered"
  | "Cancelled";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Coupon {
  id?: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate: any;
  usageLimit: number;
  usedCount: number;
  active: boolean;
}
