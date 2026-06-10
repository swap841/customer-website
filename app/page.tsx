"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/components/CartContext";
import { useCategories } from "@/hooks/useCategories";
import { useCategoriesWithCount } from "@/hooks/useCategoriesWithCount";
import { useProducts } from "@/hooks/useProducts";
import { useBanners } from "@/hooks/useBanners";
import { useContactInfo } from "@/hooks/useContactInfo";

export default function Home() {
  const { contactInfo } = useContactInfo();
  const { data: categories, isLoading: catsLoading } = useCategories();
  const { data: categoriesWithCount, isLoading: catsCountLoading } = useCategoriesWithCount();
  const { data: products, isLoading: prodsLoading } = useProducts(8);
  const { data: banners, isLoading: bannersLoading } = useBanners();
  const { subtotal } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);

  const symbol = contactInfo.currencySymbol || "\u20B9";
  const bannerList = banners ?? [];
  const badgeText = contactInfo.heroBadgeText || `${contactInfo.storeName} \u2013 Fast delivery`;
  const freeDeliveryDesc = (contactInfo.freeDeliveryDescription || "Get free delivery on orders above {symbol}{amount}")
    .replace("{symbol}", symbol).replace("{amount}", String(contactInfo.freeDeliveryAbove));
  const freeDeliveryMore = (contactInfo.freeDeliveryAddMore || "Add {symbol}{amount} more for free delivery")
    .replace("{symbol}", symbol).replace("{amount}", String(Math.round(contactInfo.freeDeliveryAbove * 0.4)));

  useEffect(() => {
    if (bannerList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [bannerList.length]);

  const catList = categories ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-teal-50/40 text-gray-900">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-64 h-64 rounded-full bg-teal-200/15 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-100/20 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-28 relative z-10">

        {/* ─── Hero Section ─── */}
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="relative">
            <div className="relative inline-flex items-center gap-2 rounded-[20px] border border-emerald-200/60 bg-white/70 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm animate-pulse">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {badgeText}
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-[1.1]">
              {contactInfo.heroTitle || "Fresh groceries, delivered in 24 hours"}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-500 sm:text-lg">
              {contactInfo.heroSubtitle || "Farm-fresh produce, dairy, snacks and daily essentials – straight to your door."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 rounded-[20px] bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                {contactInfo.heroCtaText || "Start shopping"}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 rounded-[20px] border-2 border-emerald-200 bg-white/70 backdrop-blur-sm px-7 py-3.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300"
              >
                {contactInfo.heroSecondaryCtaText || "Explore categories"}
              </Link>
            </div>
          </div>

          {/* Banner carousel */}
          <div className="flex justify-center w-full">
            {bannersLoading ? (
              <div className="w-full aspect-[4/3] rounded-[20px] bg-emerald-100/50 animate-pulse flex items-center justify-center text-emerald-700 font-bold shadow-lg">
                Loading...
              </div>
            ) : bannerList.length > 0 ? (
              <div className="w-full relative aspect-[4/3] rounded-[20px] overflow-hidden shadow-xl shadow-emerald-500/10 border border-emerald-100/60 group">
                <a href={bannerList[currentSlide].link || "/products"}>
                  <Image
                    src={bannerList[currentSlide].imageUrl || "/icon.png"}
                    alt="Store Banner"
                    fill
                    sizes="100vw"
                    className="object-cover transition-all duration-700 ease-in-out group-hover:scale-105"
                  />
                </a>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                {bannerList[currentSlide].title && (
                  <div className="absolute bottom-12 left-6 right-6 pointer-events-none">
                    <h3 className="text-white text-xl font-bold drop-shadow-lg">{bannerList[currentSlide].title}</h3>
                    {bannerList[currentSlide].subtitle && (
                      <p className="text-white/80 text-sm mt-1 drop-shadow">{bannerList[currentSlide].subtitle}</p>
                    )}
                  </div>
                )}
                {bannerList.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {bannerList.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`transition-all duration-300 ${
                          currentSlide === idx
                            ? "w-7 h-2.5 bg-white shadow-md"
                            : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"
                        } rounded-full`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full relative aspect-[4/3] rounded-[20px] overflow-hidden bg-white/80 backdrop-blur-sm border border-emerald-100/60 flex flex-col items-center justify-center p-6 shadow-xl shadow-emerald-500/10 text-center">
                <div className="text-7xl mb-4">{contactInfo.defaultBannerEmojis || "\uD83E\uDD66\uD83C\uDF4E\uD83E\uDD5B"}</div>
                <h3 className="text-xl font-bold text-gray-900">{contactInfo.storeName}</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-xs">
                  {contactInfo.defaultBannerTagline || contactInfo.tagline || "Premium products delivered fresh."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ─── Top 3 Categories (Shop by category) ─── */}
        <section className="mt-10">
          <h2 className="text-sm font-bold text-gray-900 mb-2">{contactInfo.categorySectionTitle || "Shop by category"}</h2>
          <div className="flex gap-3">
            {catsCountLoading
              ? Array(3).fill(0).map((_, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg bg-emerald-100/50 animate-pulse flex-shrink-0" />
                ))
              : (categoriesWithCount ?? [])
                  .filter((c) => c.productCount > 0)
                  .sort((a, b) => b.productCount - a.productCount)
                  .slice(0, 3)
                  .map((category) => {
                    const displayName = category.displayName || (category.name.charAt(0).toUpperCase() + category.name.slice(1));
                    const placeholderImages: Record<string, string> = {
                      "vegetables": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
                      "fruits": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
                      "pulses": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
                      "Fruits & Vegetables": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
                      "Dairy, Bread & Eggs": "https://images.unsplash.com/photo-1528750901443-e9c17cc9f60a?w=400&h=300&fit=crop",
                      "Snacks & Munchies": "https://images.unsplash.com/photo-1599490659273-e3b69007f4bc?w=400&h=300&fit=crop",
                      "Atta, Rice & Dals": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
                      "Beverages": "https://images.unsplash.com/photo-1527960656366-ee2a69d53148?w=400&h=300&fit=crop",
                    };
                    const imgSrc = category.imageUrl || placeholderImages[category.name] || placeholderImages[displayName] || "";
                    return (
                      <Link
                        key={category.id}
                        href={`/products?category=${encodeURIComponent(category.id)}`}
                        className="group flex flex-col items-center gap-1 flex-shrink-0"
                      >
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden relative border border-emerald-100/60 shadow-sm group-hover:shadow-md transition-all duration-300">
                          {imgSrc ? (
                            <Image
                              src={imgSrc}
                              alt={displayName}
                              fill
                              sizes="64px"
                              className="object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-black text-emerald-200">
                              {displayName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] font-semibold text-gray-700 text-center leading-tight max-w-16 truncate">{displayName}</span>
                      </Link>
                    );
                  })}
          </div>
        </section>

        {/* ─── Trending Products Grid ─── */}
        <section className="mt-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-700 font-bold">{contactInfo.trendingSectionLabel || "Today\u2019s best"}</p>
              <h2 className="mt-3 text-3xl font-black text-gray-900">{contactInfo.trendingSectionTitle || "Popular picks for you"}</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
              {contactInfo.trendingSectionBrowseAll || "Browse all"} <ArrowRight className="inline-block h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {prodsLoading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="rounded-[20px] border border-emerald-100/60 bg-white p-4 animate-pulse shadow-sm">
                  <div className="h-44 bg-gray-100 rounded-2xl"></div>
                  <div className="mt-4 h-3 bg-gray-100 rounded w-1/4"></div>
                  <div className="mt-3 h-5 bg-gray-100 rounded w-3/4"></div>
                  <div className="mt-2 h-3 bg-gray-100 rounded w-full"></div>
                  <div className="mt-5 flex justify-between">
                    <div className="h-5 bg-gray-100 rounded w-1/3"></div>
                    <div className="h-5 bg-gray-100 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : (
              (products ?? []).map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    discountPercentage: product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0,
                  }}
                />
              ))
            )}
          </div>
        </section>

        {/* ─── Free Delivery Progress Bar ─── */}
        <section className="mt-14 rounded-[20px] bg-gradient-to-br from-emerald-500 to-teal-600 p-6 sm:p-8 shadow-xl shadow-emerald-500/20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-xl font-black tracking-tight">{contactInfo.freeDeliveryTitle || "Free delivery"}</h3>
                <p className="text-emerald-100 text-sm mt-1">
                  {freeDeliveryDesc}
                </p>
              </div>
              <Link
                href="/products"
                className="shrink-0 inline-flex items-center gap-2 rounded-[20px] bg-white/20 backdrop-blur-sm border border-white/30 px-6 py-2.5 text-sm font-bold hover:bg-white/30 transition-all duration-300"
              >
                {contactInfo.freeDeliveryCtaText || "Start shopping"} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-5 h-3 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-white/80 relative" style={{ width: `${Math.min(((subtotal || 0) / (contactInfo.freeDeliveryAbove || 100)) * 100, 100)}%` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-white/0 rounded-full" />
              </div>
            </div>
            <p className="text-emerald-100 text-xs mt-2 font-medium">
              {freeDeliveryMore}
            </p>
          </div>
        </section>

        {/* ─── Sticky Bottom Cart Bar CTA ─── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-emerald-100/60 shadow-[0_-8px_30px_-4px_rgba(0,0,0,0.08)] px-4 py-3 sm:hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-zinc-500 font-medium">{contactInfo.orderPromptLabel || "Start your order"}</p>
              <p className="text-sm font-bold text-gray-900">{contactInfo.orderPromptTitle || "Your items await"}</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-[20px] bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
            >
              {contactInfo.orderPromptCtaText || "Shop now"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
