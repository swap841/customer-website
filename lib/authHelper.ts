import { NextRequest } from "next/server";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-u2qq.onrender.com";

export function getAuthToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.split("Bearer ")[1];
}

export function requireAuthHeader(req: NextRequest): { headers: Record<string, string> } | Response {
  const token = getAuthToken(req);
  if (!token) {
    return new Response(JSON.stringify({ success: false, error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  };
}

export { SERVER_URL };
