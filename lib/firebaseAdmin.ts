import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const app =
  getApps().length === 0 && privateKey && clientEmail
    ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
    : getApps()[0] || undefined;

export const adminDb = app ? getFirestore(app) : null;
export { FieldValue };
export function isAdminReady(): boolean {
  return adminDb !== null && privateKey !== undefined && clientEmail !== undefined;
}
