import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { app, db } from "@/firebaseConfig";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-u2qq.onrender.com";

export async function requestFcmToken(userId: string): Promise<string | null> {
  try {
    const supported = await isSupported();
    if (!supported) return null;

    const messaging = getMessaging(app);
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (currentToken) {
      // Store locally in Firestore
      await setDoc(doc(db, "users", userId), { fcmToken: currentToken }, { merge: true });
      // Register with server for OTP delivery
      try {
        const { getAuth } = await import("firebase/auth");
        const token = await getAuth().currentUser?.getIdToken();
        if (token) {
          await fetch(`${SERVER_URL}/api/auth/register-fcm-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ userId, fcmToken: currentToken, platform: "web" }),
          });
        }
      } catch {}
      return currentToken;
    }
    return null;
  } catch {
    return null;
  }
}
