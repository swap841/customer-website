import { NextRequest, NextResponse } from "next/server";
import { adminDb, FieldValue, isAdminReady } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { userId, orderData, couponCode } = await req.json();

    if (!userId || !orderData) {
      return NextResponse.json(
        { success: false, error: "Missing user or order data" },
        { status: 400 }
      );
    }

    if (!isAdminReady() || !adminDb) {
      return NextResponse.json(
        { success: false, error: "Server not configured" },
        { status: 500 }
      );
    }

    const batch = adminDb.batch();
    const orderRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("orders")
      .doc();

    const fullOrder = {
      ...orderData,
      id: orderRef.id,
      payment: {
        method: "cod",
        status: "pending",
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
    batch.set(paymentRef, {
      method: "cod",
      status: "pending",
      amount: orderData.totalAmount || 0,
      currency: "INR",
      userId,
      orderId: orderRef.id,
      createdAt: new Date().toISOString(),
    });

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
    });
  } catch (error: any) {
    console.error("Order create error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
