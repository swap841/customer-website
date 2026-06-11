import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";

export const revalidate = 3600;

interface CategoryData {
  id: string;
  name: string;
  displayName?: string;
  imageUrl?: string;
}

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

async function getCategoryBySlug(slug: string): Promise<CategoryData | null> {
  try {
    const snap = await getDocs(query(collection(db, "categories"), where("active", "==", true)));
    const found = snap.docs.find(
      (d) => d.id === slug || d.data().name?.toLowerCase().replace(/\s+/g, "-") === slug
    );
    if (!found) return null;
    const data = found.data();
    return {
      id: found.id,
      name: data.name || found.id,
      displayName: data.displayName || data.name || found.id,
      imageUrl: data.imageUrl || "",
    };
  } catch {
    return null;
  }
}

async function getProductsByCategory(categoryId: string): Promise<ProductData[]> {
  try {
    const q = query(collection(db, "products"), where("active", "==", true), where("categoryId", "==", categoryId));
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
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const snap = await getDocs(query(collection(db, "categories"), where("active", "==", true)));
    return snap.docs.map((d) => ({ slug: d.id })).concat(
      snap.docs.map((d) => ({ slug: d.data().name?.toLowerCase().replace(/\s+/g, "-") || d.id })).filter(Boolean)
    );
  } catch {
    return [];
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

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

  const products = await getProductsByCategory(category.id);
  const displayName = category.displayName || category.name.charAt(0).toUpperCase() + category.name.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 pb-16 pt-24">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-emerald-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-emerald-600">Categories</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{displayName}</span>
        </nav>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div>
            <div className="rounded-[32px] bg-white p-8 shadow-xl border border-emerald-100">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-700 font-extrabold">Category</p>
              <h1 className="mt-3 text-3xl sm:text-4xl font-black text-gray-900">{displayName}</h1>
            </div>
          </div>
          {category.imageUrl && (
            <div className="rounded-[32px] overflow-hidden border border-emerald-100 bg-white shadow-xl max-h-60 sm:max-h-72 relative aspect-[4/3]">
              <Image src={category.imageUrl} alt={displayName} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            Available in {displayName} ({products.length})
          </h2>

          {products.length === 0 ? (
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
