import { db } from "@/lib/firebaseClient";
import { collection, getDocs, query, where } from "firebase/firestore";
import ProductDetail from "@/components/ProductDetail";
import { fetchConfig } from "@/lib/configFetcher";

export const revalidate = 3600;

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

async function getAllProductIds(): Promise<string[]> {
  try {
    const q = query(collection(db, "products"), where("active", "==", true));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.id);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const ids = await getAllProductIds();
  return ids.map((id) => ({ id }));
}

async function getProductData(id: string): Promise<ProductData | null> {
  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "products", id));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      name: data.name || "Unknown",
      price: data.price || 0,
      mrp: data.mrp || data.price,
      imageUrl: data.imageUrl || "",
      images: data.images || [],
      weight: data.weight || 0,
      unit: data.unit || "g",
      description: data.description || "",
      stock: data.stock ?? 0,
      lowStockThreshold: data.lowStockThreshold ?? 5,
      categoryId: data.categoryId || "",
      active: data.active !== false,
      rating: data.rating || { average: 0, count: 0 },
    };
  } catch {
    return null;
  }
}

async function getRelatedProducts(categoryId: string, excludeId: string): Promise<ProductData[]> {
  try {
    const q = query(
      collection(db, "products"),
      where("categoryId", "==", categoryId),
      where("active", "==", true)
    );
    const snap = await getDocs(q);
    const related: ProductData[] = [];
    snap.forEach((d) => {
      if (d.id !== excludeId) {
        const r = d.data();
        related.push({
          id: d.id,
          name: r.name || "",
          price: r.price || 0,
          mrp: r.mrp || r.price,
          imageUrl: r.imageUrl || "",
          images: r.images || [],
          weight: r.weight || 0,
          unit: r.unit || "g",
          description: r.description || "",
          stock: r.stock ?? 0,
          lowStockThreshold: r.lowStockThreshold ?? 5,
          categoryId: r.categoryId || "",
          active: r.active !== false,
          rating: r.rating,
        });
      }
    });
    return related.slice(0, 5);
  } catch {
    return [];
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await fetchConfig();
  const product = await getProductData(id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-500">
        Product not found
      </div>
    );
  }

  const relatedProducts = await getRelatedProducts(product.categoryId, id);

  return <ProductDetail config={config} product={product} relatedProducts={relatedProducts} />;
}