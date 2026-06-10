"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useContactInfo } from "@/hooks/useContactInfo";

interface Category {
  id: string;
  name: string;
  displayName?: string;
  imageUrl?: string;
  productCount?: number;
}

const PLACEHOLDER_IMAGES: Record<string, string> = {
  vegetables: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
  fruits: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
  pulses: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
  "Fruits & Vegetables": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
  "Dairy, Bread & Eggs": "https://images.unsplash.com/photo-1528750901443-e9c17cc9f60a?w=400&h=300&fit=crop",
  "Snacks & Munchies": "https://images.unsplash.com/photo-1599490659273-e3b69007f4bc?w=400&h=300&fit=crop",
  "Atta, Rice & Dals": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
  Beverages: "https://images.unsplash.com/photo-1527960656366-ee2a69d53148?w=400&h=300&fit=crop",
  "Sweet Tooth": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop",
  "Munchies": "https://images.unsplash.com/photo-1599490659273-e3b69007f4bc?w=400&h=300&fit=crop",
  "Cold Drinks & Juices": "https://images.unsplash.com/photo-1527960656366-ee2a69d53148?w=400&h=300&fit=crop",
  "Instant & Frozen Food": "https://images.unsplash.com/photo-1585325701165-351af55e4029?w=400&h=300&fit=crop",
  "Tea, Coffee & Health Drinks": "https://images.unsplash.com/photo-1527960656366-ee2a69d53148?w=400&h=300&fit=crop",
  "Biscuits & Cookies": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop",
};

export default function CategoriesPage() {
  const { contactInfo } = useContactInfo();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const snap = await getDocs(query(collection(db, "categories"), where("active", "!=", false)));
        const cats = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
        const sorted = cats.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        // Count products per category
        const countsSnap = await getDocs(query(collection(db, "products"), where("active", "!=", false)));
        const countMap: Record<string, number> = {};
        countsSnap.docs.forEach((d) => {
          const data = d.data();
          const catId = data.categoryId as string | undefined;
          if (catId) countMap[catId] = (countMap[catId] || 0) + 1;
        });

        setCategories(
          sorted.map((c) => ({
            ...c,
            productCount: countMap[c.id] || 0,
          }))
        );
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-1">
        {contactInfo.categorySectionTitle || "Explore all categories"}
      </h1>
      <p className="text-sm text-gray-500 mb-6">Browse everything we have in store</p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl bg-emerald-100/50 animate-pulse" />
            ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-400">No categories available yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const displayName = cat.displayName || cat.name.charAt(0).toUpperCase() + cat.name.slice(1);
            const imgSrc = cat.imageUrl || PLACEHOLDER_IMAGES[cat.name] || PLACEHOLDER_IMAGES[displayName] || "";
            return (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.id)}`}
                className="group overflow-hidden rounded-xl border border-emerald-100/60 bg-white shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden relative">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={displayName}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-emerald-200">
                      {displayName.charAt(0)}
                    </div>
                  )}
                  {cat.productCount != null && cat.productCount > 0 && (
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md">
                      {cat.productCount} items
                    </div>
                  )}
                </div>
                <div className="px-3 py-2 text-center">
                  <p className="text-[11px] font-bold text-gray-900 truncate">{displayName}</p>
                  <p className="text-[9px] text-emerald-600 font-semibold">{cat.productCount || 0} products</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
