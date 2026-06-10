import { NextRequest } from "next/server";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-u2qq.onrender.com";
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";

export function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.split("Bearer ")[1];
}

export async function verifyIdToken(token: string): Promise<string | null> {
  if (!FIREBASE_API_KEY) return null;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.users?.[0]?.localId ?? null;
  } catch {
    return null;
  }
}

export async function requireAuthHeader(req: NextRequest): Promise<{ uid: string; headers: Record<string, string> } | Response> {
  const token = getAuthToken(req);
  if (!token) {
    return new Response(JSON.stringify({ success: false, error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const uid = await verifyIdToken(token);
  if (!uid) {
    return new Response(JSON.stringify({ success: false, error: "Invalid or expired token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return {
    uid,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  };
}

export async function verifyRequestAuth(req: NextRequest): Promise<{ uid: string; headers: Record<string, string> } | Response> {
  return requireAuthHeader(req);
}

export { SERVER_URL };
