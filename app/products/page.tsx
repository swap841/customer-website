"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "@/components/ProductCard";
import { Search, Star } from "lucide-react";

interface Category {
  id: string;
  name: string;
  displayName: string;
  order: number;
  icon?: string;
  imageUrl?: string;
}

export default function ProductsPage() {
  const { data: products, isLoading } = useProducts(50);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("category");
    if (c) setSelectedCategory(c);
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const snap = await getDocs(collection(db, "categories"));
        const list: Category[] = snap.docs.map((d) => {
          const data = d.data();
          const placeholderImages: Record<string, string> = {
            "Fruits & Vegetables": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop",
            "Dairy, Bread & Eggs": "https://images.unsplash.com/photo-1528750901443-e9c17cc9f60a?w=400&h=400&fit=crop",
            "Snacks & Munchies": "https://images.unsplash.com/photo-1599490659273-e3b69007f4bc?w=400&h=400&fit=crop",
            "Atta, Rice & Dals": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
            "Beverages": "https://images.unsplash.com/photo-1527960656366-ee2a69d53148?w=400&h=400&fit=crop",
          };
          return {
            id: d.id,
            name: data.name || "",
            displayName: data.displayName || data.name || "Uncategorized",
            order: data.order || 0,
            icon: data.icon,
            imageUrl: data.imageUrl || placeholderImages[data.name] || "",
          };
        });
        if (list.some((c) => c.order !== 0)) list.sort((a, b) => a.order - b.order);
        setCategories(list);
      } catch {
        setCategories([]);
      }
      setCategoriesLoading(false);
    }
    fetchCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    const list = products ?? [];
    return list.filter((p) => {
      const lower = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        p.name?.toLowerCase().includes(lower) ||
        p.description?.toLowerCase().includes(lower);
      const matchCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const getProductCount = (categoryId: string) => {
    return (products ?? []).filter((p) => p.categoryId === categoryId).length;
  };

  const displayCategories =
    categories.length > 0
      ? categories
      : [];

  const visibleCategories = showAllCategories
    ? displayCategories
    : displayCategories.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-3 py-2">
          <div className="mb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder='Search "apple, fruits, snacks..."'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium flex-shrink-0 transition-colors ${
                  selectedCategory === "all" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All ({(products ?? []).length})
              </button>
              {visibleCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium flex-shrink-0 transition-colors flex items-center gap-1 ${
                    selectedCategory === cat.id ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.imageUrl && (
                    <img src={cat.imageUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                  )}
                  {cat.displayName}
                  <span className={`text-xs ${selectedCategory === cat.id ? "text-emerald-100" : "text-gray-500"}`}>({getProductCount(cat.id)})</span>
                </button>
              ))}
              {displayCategories.length > 6 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium flex-shrink-0 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  {showAllCategories ? "Less" : `+${displayCategories.length - 6} more`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="mb-3">
          <h1 className="text-lg font-bold text-gray-900">
            {selectedCategory === "all" ? "All Products" : displayCategories.find((c) => c.id === selectedCategory)?.displayName || "Products"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {isLoading || categoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <Search size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 text-sm">No products found</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="mt-3 px-4 py-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={{ ...product, discountPercentage: product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0 }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
