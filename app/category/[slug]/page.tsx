"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useCategoryByName } from "@/hooks/useCategories";
import { useProductsByCategory } from "@/hooks/useProducts";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { Loader2 } from "lucide-react";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading: catLoading } = useCategoryByName(slug ?? "");
  const { data: products, isLoading: prodsLoading } = useProductsByCategory(category?.id ?? "");

  if (catLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 pb-16 pt-24">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="rounded-[32px] border border-emerald-100 bg-white p-10 shadow-xl">
            <h1 className="text-2xl font-black text-gray-900">Category not found</h1>
            <p className="mt-3 text-gray-600">The category &ldquo;{slug}&rdquo; could not be found.</p>
            <div className="mt-6">
              <Link href="/products" className="inline-flex items-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700 transition">
                Browse all products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayName = category.name.charAt(0).toUpperCase() + category.name.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 pb-16 pt-24">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div>
            <div className="rounded-[32px] bg-white p-8 shadow-xl border border-emerald-100">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-700 font-extrabold">Dynamic Category</p>
              <h1 className="mt-3 text-3xl sm:text-4xl font-black text-gray-900">{displayName}</h1>
            </div>
          </div>
          {category.imageUrl && (
            <div className="rounded-[32px] overflow-hidden border border-emerald-100 bg-white shadow-xl max-h-60 sm:max-h-72">
              <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            Available in {displayName} ({products?.length ?? 0})
          </h2>

          {prodsLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
          ) : !products || products.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-emerald-250 bg-white p-12 text-center text-gray-500 shadow-sm">
              <p className="font-semibold text-base text-gray-800">No products found</p>
              <p className="text-xs text-gray-500 mt-1">There are no active products in this category at the moment.</p>
            </div>
          ) : (
            <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
