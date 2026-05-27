import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Coupon {
  code: string;
  discountType: 'flat' | 'percent';
  value: number;
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
  orderValue: number
): Promise<ValidationResult> {
  try {
    const couponRef = doc(db, 'coupons', code.toUpperCase());
    const couponSnap = await getDoc(couponRef);

    if (!couponSnap.exists()) {
      return { valid: false, error: 'Coupon code not found' };
    }

    const coupon = couponSnap.data() as Coupon;

    // Check if active
    if (!coupon.isActive) {
      return { valid: false, error: 'This coupon is no longer active' };
    }

    // Check expiry
    const expiryDate = coupon.expiresAt instanceof Date 
      ? coupon.expiresAt 
      : new Date(coupon.expiresAt);
    if (expiryDate < new Date()) {
      return { valid: false, error: 'This coupon has expired' };
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: 'This coupon has reached its usage limit' };
    }

    // Check minimum order value
    if (orderValue < coupon.minOrderValue) {
      return { 
        valid: false, 
        error: `Minimum order value of ₹${coupon.minOrderValue} required` 
      };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percent') {
      discount = (orderValue * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    // Cap discount at order value
    discount = Math.min(discount, orderValue);

    return { valid: true, discount, coupon };
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { valid: false, error: 'Failed to validate coupon' };
  }
}
