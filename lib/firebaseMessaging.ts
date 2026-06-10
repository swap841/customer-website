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

export async function sendCheckoutOTP(phoneNumber: string, userId: string): Promise<{ success: boolean; error?: string; code?: string }> {
  try {
    const response = await fetch(`${SERVER_URL}/api/auth/send-otp-fcm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, userId }),
    });
    const data = await response.json();
    return data;
  } catch {
    return { success: false, error: "Network error. Please check your connection." };
  }
}

export async function verifyCheckoutOTP(phoneNumber: string, otp: string, userId: string): Promise<{ success: boolean; error?: string; code?: string }> {
  try {
    const response = await fetch(`${SERVER_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, otp, userId }),
    });
    const data = await response.json();
    return data;
  } catch {
    return { success: false, error: "Network error. Please check your connection." };
  }
}
