"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/ProductCard";
import { Heart, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
interface Product { id: string; name: string; price: number; mrp?: number; imageUrl?: string; weight?: number; unit?: string; stock?: number; categoryId?: string; lowStockThreshold?: number; rating?: { average: number; count: number }; }

export default function WishlistPage() {
  const { wishlistIds, loading: wishlistLoading } = useWishlist();
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      if (!wishlistIds.length) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const results: Product[] = [];
      for (const id of wishlistIds) {
        try {
          const snap = await getDoc(doc(db, "products", id));
          if (snap.exists()) {
            results.push({ id: snap.id, ...snap.data() } as Product);
          }
        } catch { /* skip */ }
      }
      setProducts(results);
      setLoading(false);
    }
    if (!wishlistLoading) fetchProducts();
  }, [wishlistIds, wishlistLoading]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-8">
        <div className="text-center">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Wishlist</h1>
          <p className="text-gray-500">Sign in to view your wishlist</p>
          <Link href="/" className="mt-4 inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold text-sm">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-100 p-2.5 rounded-xl">
            <Heart size={24} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-500">{products.length} items</p>
          </div>
          <Link href="/products" className="ml-auto text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-emerald-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save your favorite items here</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
