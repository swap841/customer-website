"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { getAuth } from "firebase/auth";
import type { Review } from "../../shared/models";

export function useReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    const q = query(
      collection(db, "reviews"),
      where("productId", "==", productId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setReviews(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review)));
      setLoading(false);
    });
    return () => unsub();
  }, [productId]);

  return { reviews, loading };
}

export async function addReview(productId: string, rating: number, comment: string) {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");
  const ref = collection(db, "reviews");
  const docRef = await addDoc(ref, {
    productId,
    userId: user.uid,
    userName: user.displayName || "Anonymous",
    rating,
    comment,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
