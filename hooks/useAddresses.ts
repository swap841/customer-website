"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/firebaseConfig";

export interface SavedAddress {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
  label?: string;
  usedAt: Timestamp;
}

export function useAddresses() {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || null);
      if (!user) {
        setSavedAddresses([]);
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "users", uid, "addresses"),
      orderBy("usedAt", "desc"),
      limit(5)
    );

    const unsubSnapshot = onSnapshot(
      q,
      (snapshot) => {
        const addresses: SavedAddress[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          addresses.push({
            id: doc.id,
            address: data.address || "",
            lat: data.lat,
            lng: data.lng,
            label: data.label,
            usedAt: data.usedAt,
          });
        });
        setSavedAddresses(addresses);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubSnapshot();
  }, [uid]);

  const saveAddress = async (
    address: string,
    lat?: number,
    lng?: number,
    label?: string
  ) => {
    if (!uid || !address.trim()) return;
    try {
      await addDoc(collection(db, "users", uid, "addresses"), {
        address: address.trim(),
        lat: lat || null,
        lng: lng || null,
        label: label || null,
        usedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  return { savedAddresses, saveAddress, loading };
}
