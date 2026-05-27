import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export interface Coupon {
  code: string;
  discountType: "flat" | "percent";
  discount: number;
  value: number;
  minOrderAmount: number;
  minOrderValue: number;
  expiresAt: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface ValidationResult {
  valid: boolean;
  discount?: number;
  coupon?: Coupon;
  error?: string;
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<ValidationResult> {
  try {
    const couponRef = doc(db, "coupons", code.toUpperCase());
    const snap = await getDoc(couponRef);

    if (!snap.exists()) {
      return { valid: false, error: "Coupon code not found" };
    }

    const coupon = { ...snap.data(), code: snap.id } as Coupon;

    if (!coupon.isActive) {
      return { valid: false, error: "This coupon is no longer active" };
    }

    const expiryDate =
      coupon.expiresAt instanceof Date
        ? coupon.expiresAt
        : new Date(coupon.expiresAt);
    if (expiryDate < new Date()) {
      return { valid: false, error: "This coupon has expired" };
    }

    const minOrder = coupon.minOrderAmount || coupon.minOrderValue || 0;
    if (subtotal < minOrder) {
      return {
        valid: false,
        error: `Minimum order value of ₹${minOrder} required`,
      };
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: "This coupon has reached its usage limit" };
    }

    let discount = 0;
    if (coupon.discountType === "percent") {
      const pct = coupon.value || coupon.discount || 0;
      discount = (subtotal * pct) / 100;
    } else {
      discount = coupon.value || coupon.discount || 0;
    }

    discount = Math.min(discount, subtotal);

    return { valid: true, discount, coupon };
  } catch (error) {
    console.error("Error validating coupon:", error);
    return { valid: false, error: "Failed to validate coupon" };
  }
}
