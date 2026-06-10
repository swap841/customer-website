"use client";
import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export interface SavedAddress {
  address: string;
  lat: number | null;
  lng: number | null;
  label: string;
  pincode: string;
  usedAt?: any;
}

export function useAddress() {
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (u) => {
      setUser(u);
      if (!u) {
        setSavedAddress(null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "shippingAddress", "current");
    const load = async () => {
      try {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setSavedAddress(snap.data() as SavedAddress);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, [user]);

  const saveAddress = useCallback(async (address: string, lat?: number | null, lng?: number | null, label?: string) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "shippingAddress", "current");
    const data: SavedAddress = {
      address,
      lat: lat ?? null,
      lng: lng ?? null,
      label: label || "Home",
      pincode: address.match(/\b\d{6}\b/)?.[0] || "",
      usedAt: serverTimestamp(),
    };
    await setDoc(ref, data);
    setSavedAddress(data);
  }, [user]);

  const clearAddress = useCallback(async () => {
    if (!user) return;
    setSavedAddress(null);
  }, [user]);

  return { savedAddress, loading, saveAddress, clearAddress };
}
