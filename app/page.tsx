"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useBanners } from "@/hooks/useBanners";
import { useContactInfo } from "@/hooks/useContactInfo";

export default function Home() {
  const { contactInfo } = useContactInfo();
  const { data: categories, isLoading: catsLoading } = useCategories();
  const { data: products, isLoading: prodsLoading } = useProducts(6);
  const { data: banners, isLoading: bannersLoading } = useBanners();
  const [currentSlide, setCurrentSlide] = useState(0);

  const bannerList = banners ?? [];

  useEffect(() => {
    if (bannerList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerList.length]);

  const catList = categories ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 pt-28 sm:pt-32">
        <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              🛒 {contactInfo.storeName} – Fast grocery delivery
            </p>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              {contactInfo.heroTitle || "Fresh groceries, delivered in 24 hours"}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
              {contactInfo.heroSubtitle || "Farm-fresh produce, dairy, snacks and daily essentials – straight to your door."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-3xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition"
              >
                Start shopping
              </Link>
              <Link
                href="/category/vegetables"
                className="inline-flex items-center gap-2 rounded-3xl border border-emerald-600 px-6 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition"
              >
                Explore categories
              </Link>
            </div>
          </div>

          <div className="flex justify-center w-full">
            {bannersLoading ? (
              <div className="w-full aspect-[4/3] rounded-[32px] bg-emerald-100/50 animate-pulse flex items-center justify-center text-emerald-700 font-bold">
                Loading Banners...
              </div>
            ) : bannerList.length > 0 ? (
              <div className="w-full relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-xl border border-emerald-100">
                <a href={bannerList[currentSlide].link || "/products"}>
                  <img
                    src={bannerList[currentSlide].imageUrl}
                    alt="Store Banner"
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out"
                  />
                </a>
                {bannerList.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {bannerList.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition ${
                          currentSlide === idx ? "bg-white scale-110" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full relative aspect-[4/3] rounded-[32px] overflow-hidden bg-white border border-emerald-100 flex flex-col items-center justify-center p-6 shadow-xl text-center">
                <div className="text-7xl mb-4">🥦🍎🥛</div>
                <h3 className="text-xl font-bold text-gray-900">{contactInfo.storeName}</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-xs">
                  {contactInfo.tagline || "Premium grocery delivery directly from local farmers."}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-700 font-bold">Shop by category</p>
              <h2 className="mt-3 text-3xl font-black text-gray-900">Fresh categories</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              View all products <ArrowRight className="inline-block h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {catsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="rounded-[32px] border border-emerald-100 bg-white shadow-sm p-6 animate-pulse">
                  <div className="h-52 bg-gray-200 rounded-2xl"></div>
                  <div className="mt-4 h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="mt-3 h-6 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))
            ) : (
              catList.map((category) => {
                const displayName = category.name.charAt(0).toUpperCase() + category.name.slice(1);
                return (
                  <Link
                    key={category.id}
                    href={`/category/${category.name}`}
                    className="group overflow-hidden rounded-[32px] border border-emerald-100 bg-white shadow-sm transition hover:shadow-xl"
                  >
                    <div className="h-52 overflow-hidden bg-slate-100">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={displayName}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-emerald-50 text-emerald-800 font-bold">
                          {displayName}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">{category.name}</p>
                      <h3 className="mt-3 text-xl font-bold text-gray-900">{displayName}</h3>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-700 font-bold">Today&#39;s best</p>
              <h2 className="mt-3 text-3xl font-black text-gray-900">Fresh picks for you</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              Browse all <ArrowRight className="inline-block h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {prodsLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="rounded-[32px] border border-emerald-100 bg-white p-5 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-3xl"></div>
                  <div className="mt-4 h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="mt-3 h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="mt-2 h-4 bg-gray-200 rounded w-full"></div>
                  <div className="mt-5 flex justify-between">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : (
              (products ?? []).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group overflow-hidden rounded-[32px] border border-emerald-100 bg-white p-5 shadow-sm transition hover:shadow-xl"
                >
                  <div className="overflow-hidden rounded-3xl bg-slate-100">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-48 w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="h-48 w-full flex items-center justify-center bg-emerald-50 text-emerald-800 font-bold">{product.name}</div>
                    )}
                  </div>
                  <div className="mt-4">
                    {product.rating && product.rating.count > 0 && (
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} className={s <= Math.round(product.rating!.average) ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                        ))}
                        <span className="text-[10px] text-gray-400 ml-1">({product.rating.count})</span>
                      </div>
                    )}
                    <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">{product.categoryId}</p>
                    <h3 className="mt-3 text-xl font-bold text-gray-900">{product.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{product.description}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3 text-sm font-semibold">
                    <div>
                      <span className="text-emerald-700">₹{product.price}</span>
                      {product.mrp && product.mrp > product.price && (
                        <span className="ml-2 text-zinc-400 line-through">₹{product.mrp}</span>
                      )}
                    </div>
                    <span className="text-zinc-500">{product.weight}{product.unit}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
