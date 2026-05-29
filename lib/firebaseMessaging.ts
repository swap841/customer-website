import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { app, db } from "@/firebaseConfig";

export async function requestFcmToken(userId: string): Promise<string | null> {
  try {
    const supported = await isSupported();
    if (!supported) return null;

    const messaging = getMessaging(app);
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (currentToken) {
      await setDoc(doc(db, "users", userId), { fcmToken: currentToken }, { merge: true });
      return currentToken;
    }
    return null;
  } catch {
    return null;
  }
}
