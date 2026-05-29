import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate: Date;
  usageLimit: number;
  usedCount: number;
  active: boolean;
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

    const data = snap.data();
    const coupon: Coupon = {
      code: snap.id,
      discountType: data.discountType || "percentage",
      discountValue: data.discountValue || 0,
      minOrderAmount: data.minOrderAmount || 0,
      maxDiscount: data.maxDiscount,
      expiryDate: data.expiryDate instanceof Date ? data.expiryDate : new Date(data.expiryDate?.seconds ? data.expiryDate.seconds * 1000 : data.expiryDate),
      usageLimit: data.usageLimit || 0,
      usedCount: data.usedCount || 0,
      active: data.active !== false,
    };

    if (!coupon.active) {
      return { valid: false, error: "This coupon is no longer active" };
    }

    if (coupon.expiryDate < new Date()) {
      return { valid: false, error: "This coupon has expired" };
    }

    if (subtotal < coupon.minOrderAmount) {
      return {
        valid: false,
        error: `Minimum order value of ₹${coupon.minOrderAmount} required`,
      };
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: "This coupon has reached its usage limit" };
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (subtotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    discount = Math.min(discount, subtotal);

    return { valid: true, discount, coupon };
  } catch (error) {
    console.error("Error validating coupon:", error);
    return { valid: false, error: "Failed to validate coupon" };
  }
}
