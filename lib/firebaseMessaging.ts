import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { getAppConfig } from "./appConfig";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-u2qq.onrender.com";

async function getVapidKey(): Promise<string> {
  try {
    const config = await getAppConfig();
    const vapidKey = (config as any).notifications?.vapidKey;
    if (vapidKey) return vapidKey;
  } catch {}
  return process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";
}

export async function requestFcmToken(uid: string): Promise<string | null> {
  try {
    if (typeof window === "undefined") return null;
    
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const messaging = getMessaging(app);
    
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[FCM] Notification permission denied");
      return null;
    }
    
    const vapidKey = await getVapidKey();
    if (!vapidKey) {
      console.error("[FCM] No VAPID key configured. Set it in Dashboard → Settings → Notifications.");
      return null;
    }
    
    const token = await getToken(messaging, { vapidKey });
    
    if (token) {
      await fetch(`${SERVER_URL}/api/fcm/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: uid, token }),
      });
      console.log("[FCM] Token registered for user:", uid);
    }
    
    return token;
  } catch (error) {
    console.error("[FCM] Error:", error);
    return null;
  }
}

async function apiPost(path: string, body: Record<string, unknown>): Promise<{ success: boolean; error?: string; code?: string; status?: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(`${SERVER_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await response.json();
    data.status = response.status;
    return data;
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name === "AbortError") {
      return { success: false, error: "Server took too long to respond. It may be starting up — try again in 30 seconds.", code: "TIMEOUT" };
    }
    return { success: false, error: `Cannot reach server (${SERVER_URL}). It may be waking up — try again in 30 seconds.`, code: "NETWORK_ERROR" };
  }
}

export async function sendCheckoutOTP(phoneNumber: string, userId: string): Promise<{ success: boolean; error?: string; code?: string }> {
  const data = await apiPost("/api/auth/send-otp-fcm", { phoneNumber, userId });
  if (!data.success && data.error) {
    const messages: Record<string, string> = {
      NO_FCM_TOKEN: "Notifications not enabled. Please allow browser notifications (click the lock/site-info icon in your address bar), then try again.",
      FCM_FAILED: "Could not send notification. Check browser notification settings and try again.",
      TIMEOUT: data.error,
      NETWORK_ERROR: data.error,
    };
    data.error = messages[data.code!] || data.error;
  }
  return data;
}

export async function verifyCheckoutOTP(phoneNumber: string, otp: string, userId: string): Promise<{ success: boolean; error?: string; code?: string }> {
  const data = await apiPost("/api/auth/verify-otp", { phoneNumber, otp, userId });
  if (!data.success && data.error) {
    const messages: Record<string, string> = {
      OTP_NOT_FOUND: "OTP expired or not found. Please request a new OTP.",
      OTP_EXPIRED: "OTP expired. Please request a new OTP.",
      OTP_INCORRECT: data.error,
      MAX_ATTEMPTS: "Too many wrong attempts. Please request a new OTP.",
      USER_MISMATCH: "OTP was sent to a different account.",
      TIMEOUT: data.error,
      NETWORK_ERROR: data.error,
    };
    data.error = messages[data.code!] || data.error;
  }
  return data;
}
