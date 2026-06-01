import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
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
  orderValue: number
): Promise<ValidationResult> {
  try {
    const couponRef = doc(db, 'coupons', code.toUpperCase());
    const couponSnap = await getDoc(couponRef);

    if (!couponSnap.exists()) {
      return { valid: false, error: 'Coupon code not found' };
    }

    const data = couponSnap.data();
    const coupon: Coupon = {
      code: couponSnap.id,
      discountType: data.discountType || 'percentage',
      discountValue: data.discountValue || 0,
      minOrderAmount: data.minOrderAmount || 0,
      maxDiscount: data.maxDiscount,
      expiryDate: data.expiryDate instanceof Date ? data.expiryDate : new Date(data.expiryDate?.seconds ? data.expiryDate.seconds * 1000 : data.expiryDate),
      usageLimit: data.usageLimit || 0,
      usedCount: data.usedCount || 0,
      active: data.active !== false,
    };

    if (!coupon.active) {
      return { valid: false, error: 'This coupon is no longer active' };
    }

    const expiryDate = coupon.expiryDate instanceof Date
      ? coupon.expiryDate
      : new Date(coupon.expiryDate);
    if (expiryDate < new Date()) {
      return { valid: false, error: 'This coupon has expired' };
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: 'This coupon has reached its usage limit' };
    }

    if (orderValue < coupon.minOrderAmount) {
      return {
        valid: false,
        error: `Minimum order value of ₹${coupon.minOrderAmount} required`
      };
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderValue * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    discount = Math.min(discount, orderValue);

    return { valid: true, discount, coupon };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, error: 'Failed to validate coupon' };
  }
}
