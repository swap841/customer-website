"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  getDocs,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/firebaseConfig";

export interface SavedAddress {
  id: string;
  address: string;
  lat?: number;
  lng?: number;
  label: string;
  landmark?: string;
  usedAt: Timestamp;
}

const LABEL_OPTIONS = ["Home", "Work", "Other"] as const;

function normalizeAddress(addr: string): string {
  return addr
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[,\s]+$/g, "")
    .trim();
}

function inferLabel(address: string): string {
  const lower = address.toLowerCase();
  if (lower.includes("home") || lower.includes("house") || lower.includes("apartment") || lower.includes("flat")) return "Home";
  if (lower.includes("office") || lower.includes("work") || lower.includes("company") || lower.includes("business")) return "Work";
  return "Home";
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
      limit(10)
    );

    const unsubSnapshot = onSnapshot(
      q,
      (snapshot) => {
        const seen = new Set<string>();
        const deduped: SavedAddress[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const normalized = normalizeAddress(data.address || "");
          if (seen.has(normalized)) return;
          seen.add(normalized);
          deduped.push({
            id: docSnap.id,
            address: data.address || "",
            lat: data.lat,
            lng: data.lng,
            label: data.label || "Home",
            landmark: data.landmark,
            usedAt: data.usedAt,
          });
        });
        setSavedAddresses(deduped.slice(0, 5));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubSnapshot();
  }, [uid]);

  const saveAddress = async (
    address: string,
    lat?: number,
    lng?: number,
    label?: string,
    landmark?: string
  ) => {
    if (!uid || !address.trim()) return;
    const normalized = normalizeAddress(address);

    try {
      const existing = await getDocs(
        query(
          collection(db, "users", uid, "addresses"),
          orderBy("usedAt", "desc"),
          limit(20)
        )
      );

      let duplicateId: string | null = null;
      existing.forEach((docSnap) => {
        const existingNorm = normalizeAddress(docSnap.data().address || "");
        if (existingNorm === normalized) {
          duplicateId = docSnap.id;
        }
      });

      if (duplicateId) {
        const { updateDoc } = await import("firebase/firestore");
        await updateDoc(doc(db, "users", uid, "addresses", duplicateId), {
          usedAt: serverTimestamp(),
          ...(label ? { label } : {}),
          ...(lat ? { lat } : {}),
          ...(lng ? { lng } : {}),
        });
      } else {
        await addDoc(collection(db, "users", uid, "addresses"), {
          address: address.trim(),
          lat: lat || null,
          lng: lng || null,
          label: label || inferLabel(address),
          landmark: landmark || null,
          usedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!uid) return;
    try {
      await deleteDoc(doc(db, "users", uid, "addresses", id));
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  return { savedAddresses, saveAddress, deleteAddress, loading };
}
