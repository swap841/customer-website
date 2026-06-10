import { NextRequest, NextResponse } from "next/server";
import { requireAuthHeader, SERVER_URL } from "@/lib/authHelper";
import { createRazorpayOrder } from "@/lib/firestoreAdmin";

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuthHeader(req);
    if (auth instanceof Response) return auth;

    const { amount, receipt } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount. Must be greater than 0." }, { status: 400 });
    }

    const orderId = await createRazorpayOrder(amount, receipt);
    return NextResponse.json({ success: true, orderId, amount, currency: "INR", message: "Order initialized successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to initialize Razorpay order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
