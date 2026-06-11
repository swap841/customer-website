import { NextRequest, NextResponse } from "next/server";
import { requireAuthHeader, SERVER_URL } from "@/lib/authHelper";
import { commit, isAdminReady } from "@/lib/firestoreAdmin";
import type { WriteOp } from "@/lib/firestoreAdmin";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuthHeader(req);
    if (auth instanceof Response) return auth;

    const { userId, orderData, couponCode } = await req.json();

    if (!orderData) {
      return NextResponse.json({ success: false, error: "Missing order data" }, { status: 400 });
    }

    const uid = auth.uid;
    if (!uid) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminReady()) {
      return NextResponse.json({ success: false, error: "Server not configured" }, { status: 500 });
    }

    const orderId = `order_${crypto.randomUUID().replace(/-/g, "").substring(0, 16)}`;
    const fullOrder = {
      ...orderData, id: orderId, userId: uid,
      payment: { method: "cod", status: "pending" },
      status: "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const writes: WriteOp[] = [
      { operation: "set", collection: `users/${uid}/orders`, docId: orderId, data: fullOrder },
      { operation: "create", collection: "payments", data: {
        method: "cod", status: "pending", amount: orderData.totalAmount || 0,
        currency: "INR", userId: uid, orderId, createdAt: new Date().toISOString(),
      }},
    ];

    if (orderData.items && Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        if (item.productId) {
          writes.push({
            operation: "update", collection: "products", docId: item.productId, data: {},
            transforms: [{ fieldPath: "stock", increment: -(item.quantity || 1) }],
          });
        }
      }
    }

    if (couponCode) {
      writes.push({
        operation: "update", collection: "coupons", docId: couponCode.toUpperCase(), data: {},
        transforms: [{ fieldPath: "usedCount", increment: 1 }],
      });
    }

    await commit(writes);
    return NextResponse.json({ success: true, orderId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
