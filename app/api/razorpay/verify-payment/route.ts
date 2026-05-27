import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminDb, FieldValue, isAdminReady } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      orderData,
      couponCode,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing required payment parameters" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Payment verification not configured" },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    if (!userId || !orderData) {
      return NextResponse.json(
        { success: false, error: "Missing user or order data" },
        { status: 400 }
      );
    }

    if (!isAdminReady() || !adminDb) {
      return NextResponse.json(
        { success: false, error: "Server not configured for order processing" },
        { status: 500 }
      );
    }

    const batch = adminDb.batch();
    const orderRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("orders")
      .doc();

    const paymentRecord = {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      method: "razorpay",
      status: "paid",
      amount: orderData.totalAmount || orderData.finalTotal || 0,
      currency: "INR",
      userId,
      orderId: orderRef.id,
      createdAt: new Date().toISOString(),
    };

    const fullOrder = {
      ...orderData,
      id: orderRef.id,
      payment: {
        method: "razorpay",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: "paid",
      },
      status: "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    batch.set(orderRef, fullOrder);

    if (orderData.items && Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        if (item.productId) {
          const productRef = adminDb.collection("products").doc(item.productId);
          batch.update(productRef, {
            stock: FieldValue.increment(-(item.quantity || 1)),
          });
        }
      }
    }

    const paymentRef = adminDb.collection("payments").doc();
    batch.set(paymentRef, paymentRecord);

    if (couponCode) {
      const couponRef = adminDb.collection("coupons").doc(couponCode.toUpperCase());
      batch.update(couponRef, {
        usedCount: FieldValue.increment(1),
      });
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      message: "Payment verified and order created successfully",
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}
