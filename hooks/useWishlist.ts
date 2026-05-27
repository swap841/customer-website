"use client";

import { useState, useEffect, useCallback } from "react";
import {
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export function useWishlist() {
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (u) => {
      setUser(u);
      if (!u) {
        setWishlistIds([]);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid, "wishlist", "items");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setWishlistIds(snap.data().productIds ?? []);
      } else {
        setWishlistIds([]);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const u = getAuth().currentUser;
      if (!u) return;
      const ref = doc(db, "users", u.uid, "wishlist", "items");
      const snap = await getDoc(ref);
      if (snap.exists() && (snap.data().productIds ?? []).includes(productId)) {
        await setDoc(ref, { productIds: arrayRemove(productId) }, { merge: true });
      } else {
        await setDoc(ref, { productIds: arrayUnion(productId) }, { merge: true });
      }
    },
    []
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  return { wishlistIds, toggleWishlist, isWishlisted, loading };
}
