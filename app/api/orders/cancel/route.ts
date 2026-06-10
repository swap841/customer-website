import { NextRequest, NextResponse } from "next/server";
import { requireAuthHeader, SERVER_URL } from "@/lib/authHelper";

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuthHeader(req);
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const res = await fetch(`${SERVER_URL}/api/orders/cancel`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ success: false, error: data.error || "Cancel request failed" }, { status: res.status });
    }
    return NextResponse.json({ success: true, ...data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
