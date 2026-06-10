export async function requestFcmToken(uid: string): Promise<string | null> {
  try {
    if (typeof window === "undefined") return null;
    const { getMessaging, getToken } = await import("firebase/messaging");
    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    return token;
  } catch {
    return null;
  }
}
