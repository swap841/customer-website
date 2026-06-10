import { NextRequest, NextResponse } from "next/server";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-u2qq.onrender.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${SERVER_URL}/api/auth/send-otp-fcm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to send OTP" }, { status: 500 });
  }
}
