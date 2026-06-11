"use client";

import { useEffect, useState, type ReactNode } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

interface ProductStockProps {
  productId: string;
  initialStock: number;
  lowStockThreshold?: number;
  children?: (currentStock: number) => ReactNode;
}

export default function ProductStock({ productId, initialStock, lowStockThreshold = 5, children }: ProductStockProps) {
  const [stock, setStock] = useState(initialStock);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStock(initialStock);
    setLoading(true);

    const unsub = onSnapshot(
      doc(db, "products", productId),
      (snap) => {
        if (snap.exists()) {
          setStock(snap.data().stock ?? 0);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsub();
  }, [productId, initialStock]);

  if (children) {
    return <>{children(stock)}</>;
  }

  if (loading) {
    return (
      <span className="h-3 w-16 bg-gray-100 rounded animate-pulse inline-block" />
    );
  }

  const outOfStock = stock <= 0;
  return (
    <span className={`font-semibold ${outOfStock ? "text-red-600" : stock <= lowStockThreshold ? "text-orange-600" : "text-emerald-600"}`}>
      {outOfStock ? "Out of Stock" : stock <= lowStockThreshold ? `Only ${stock} left` : "In Stock"}
    </span>
  );
}
