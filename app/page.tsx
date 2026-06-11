import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { fetchConfig } from "@/lib/configFetcher";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";
import BannerCarousel from "@/components/BannerCarousel";
import FreeDeliveryBar from "@/components/FreeDeliveryBar";

export const revalidate = 3600;

interface ProductData {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  imageUrl: string;
  weight: number;
  unit: string;
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
  imageUrl?: string;
  productCount: number;
}

interface BannerData {
  id: string;
  imageUrl: string;
  link?: string;
}

async function getProducts(): Promise<ProductData[]> {
  try {
    const q = query(collection(db, "products"), where("active", "==", true), limit(8));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || "",
        price: data.price || 0,
        mrp: data.mrp || data.price,
        imageUrl: data.imageUrl || "",
        weight: data.weight || 0,
        unit: data.unit || "g",
        stock: data.stock ?? 0,
        lowStockThreshold: data.lowStockThreshold ?? 5,
        categoryId: data.categoryId || "",
        active: data.active !== false,
        rating: data.rating || { average: 0, count: 0 },
      };
    });
  } catch { return []; }
}

async function getCategoriesWithCount(): Promise<CategoryData[]> {
  try {
    const catSnap = await getDocs(query(collection(db, "categories"), where("active", "!=", false)));
    const cats = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const prodSnap = await getDocs(query(collection(db, "products"), where("active", "!=", false)));
    const countMap: Record<string, number> = {};
    prodSnap.docs.forEach((d) => {
      const catId = d.data().categoryId as string | undefined;
      if (catId) countMap[catId] = (countMap[catId] || 0) + 1;
    });

    return cats.map((c: any) => ({
      id: c.id,
      name: c.name || c.id,
      displayName: c.displayName || (c.name ? c.name.charAt(0).toUpperCase() + c.name.slice(1) : ""),
      imageUrl: c.imageUrl || "",
      productCount: countMap[c.id] || 0,
    }));
  } catch { return []; }
}

async function getBanners(): Promise<BannerData[]> {
  try {
    const snap = await getDocs(collection(db, "banners"));
    return snap.docs.map((d) => ({
      id: d.id,
      imageUrl: d.data().imageUrl || "",
      link: d.data().link || "",
    }));
  } catch { return []; }
}

export default async function Home() {
  const config = await fetchConfig();
  const [products, categoriesWithCount, banners] = await Promise.all([
    getProducts(),
    getCategoriesWithCount(),
    getBanners(),
  ]);

  const symbol = config.currencySymbol || "\u20B9";

  const placeholderImages: Record<string, string> = {
    vegetables: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
    fruits: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
    pulses: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
    "Fruits & Vegetables": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
    "Dairy, Bread & Eggs": "https://images.unsplash.com/photo-1528750901443-e9c17cc9f60a?w=400&h=300&fit=crop",
    "Snacks & Munchies": "https://images.unsplash.com/photo-1599490659273-e3b69007f4bc?w=400&h=300&fit=crop",
    "Atta, Rice & Dals": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
    Beverages: "https://images.unsplash.com/photo-1527960656366-ee2a69d53148?w=400&h=300&fit=crop",
  };

  const topCategories = categoriesWithCount
    .filter((c) => c.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-teal-50/40 text-gray-900">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-64 h-64 rounded-full bg-teal-200/15 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-100/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid items-center gap-10 pt-10 sm:pt-16 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/60 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {config.storeName} – Fast delivery
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-[1.1]">
              {"Fresh groceries, delivered in 24 hours"}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-gray-500 sm:text-lg">
              {"Farm-fresh produce, dairy, snacks and daily essentials – straight to your door."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products"
                className="group inline-flex items-center gap-2 rounded-[20px] bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                Start shopping
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link href="/categories"
                className="inline-flex items-center gap-2 rounded-[20px] border-2 border-emerald-200 bg-white/70 backdrop-blur-sm px-7 py-3.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300"
              >
                Explore categories
              </Link>
            </div>
          </div>

          <div className="flex justify-center w-full">
            {banners.length > 0 ? (
              <BannerCarousel banners={banners} />
            ) : (
              <div className="w-full aspect-[4/3] rounded-[20px] bg-emerald-100/50 flex items-center justify-center text-emerald-700 font-bold shadow-lg border border-emerald-100/60">
                <div className="text-center p-6">
                  <p className="text-lg">Fresh Groceries</p>
                  <p className="text-sm mt-1 opacity-75">Delivered to your doorstep</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {topCategories.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-bold text-gray-900 mb-2">Shop by category</h2>
            <div className="flex gap-3">
              {topCategories.map((category) => {
                const displayName = category.displayName || (category.name.charAt(0).toUpperCase() + category.name.slice(1));
                const imgSrc = category.imageUrl || placeholderImages[category.name] || placeholderImages[displayName] || "";
                return (
                  <Link key={category.id} href={`/products?category=${encodeURIComponent(category.id)}`}
                    className="group flex flex-col items-center gap-1 flex-shrink-0"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden relative border border-emerald-100/60 shadow-sm group-hover:shadow-md transition-all duration-300">
                      {imgSrc ? (
                        <Image src={imgSrc} alt={displayName} fill sizes="64px" className="object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-black text-emerald-200">{displayName.charAt(0)}</div>
                      )}
                    </div>
                    <span className="text-[9px] font-semibold text-gray-700 text-center leading-tight max-w-16 truncate">{displayName}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-14">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-700 font-bold">Today&apos;s best</p>
              <h2 className="mt-3 text-3xl font-black text-gray-900">Popular picks for you</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
              Browse all <ArrowRight className="inline-block h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <ProductGrid products={products} />
          </div>
        </section>

        <FreeDeliveryBar />
      </div>
    </div>
  );
}
