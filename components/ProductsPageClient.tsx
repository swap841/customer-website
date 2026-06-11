"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import ProductGrid from "@/components/ProductGrid";
import { Search, Loader2 } from "lucide-react";
import { VoiceSearch } from "@/components/VoiceSearch";

interface ProductData {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  imageUrl: string;
  images?: string[];
  weight: number;
  unit: string;
  description: string;
  stock: number;
  lowStockThreshold: number;
  categoryId: string;
  active: boolean;
  rating?: { average: number; count: number };
}

interface CategoryData {
  id: string;
  name: string;
  displayName?: string;
  order?: number;
  imageUrl?: string;
}

export default function ProductsPageClient({
  initialProducts,
  categories,
}: {
  initialProducts: ProductData[];
  categories: CategoryData[];
}) {
  const [allProducts, setAllProducts] = useState<ProductData[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef(initialProducts.length > 0 ? initialProducts[initialProducts.length - 1].id : "");
  const isLoadingMore = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("category");
    if (c) setSelectedCategory(c);
  }, []);

  useEffect(() => {
    setAllProducts(initialProducts);
    cursorRef.current = initialProducts.length > 0 ? initialProducts[initialProducts.length - 1].id : "";
    setHasMore(true);
  }, [initialProducts, selectedCategory, searchTerm]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore.current || !hasMore) return;
    isLoadingMore.current = true;
    setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      params.set("cursor", cursorRef.current);
      params.set("limit", "20");
      if (selectedCategory !== "all") params.set("category", selectedCategory);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.products?.length) {
        setAllProducts((prev) => [...prev, ...data.products]);
        cursorRef.current = data.products[data.products.length - 1].id;
      }
      setHasMore(data.hasMore);
    } catch { /* ignore */ }
    finally {
      setLoadingMore(false);
      isLoadingMore.current = false;
    }
  }, [hasMore, selectedCategory]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.5 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const filteredProducts = useMemo(() => {
    let list = allProducts;
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.categoryId === selectedCategory);
    }
    if (searchTerm.trim()) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return list;
  }, [allProducts, selectedCategory, searchTerm]);

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none focus:border-emerald-400 transition-all"
          />
          <VoiceSearch onResult={(text) => setSearchTerm(text)} />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedCategory === "all"
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {visibleCategories.map((cat) => {
              const displayName = cat.displayName || cat.name.charAt(0).toUpperCase() + cat.name.slice(1);
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    selectedCategory === cat.id
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {displayName}
                </button>
              );
            })}
            {categories.length > 6 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-emerald-600 hover:bg-gray-200 transition"
              >
                {showAllCategories ? "Show less" : `+${categories.length - 6} more`}
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="rounded-[20px] border border-gray-100 bg-white p-4 animate-pulse shadow-sm">
              <div className="h-44 bg-gray-100 rounded-2xl" />
              <div className="mt-4 h-3 bg-gray-100 rounded w-1/4" />
              <div className="mt-3 h-5 bg-gray-100 rounded w-3/4" />
              <div className="mt-2 h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 font-medium">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          <ProductGrid products={filteredProducts} />
        </div>
      )}

      {loadingMore && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      )}

      <div ref={sentinelRef} className="h-4" />
    </div>
  );
}
