import { collection, getDocs, query, where, limit as fLimit } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import ProductsPageClient from "@/components/ProductsPageClient";

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

interface CategoryData {
  id: string;
  name: string;
  displayName?: string;
  order?: number;
  imageUrl?: string;
}

async function getCategories(): Promise<CategoryData[]> {
  try {
    const snap = await getDocs(query(collection(db, "categories"), where("active", "==", true)));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || d.id,
        displayName: data.displayName || data.name || d.id,
        order: data.order || 0,
        imageUrl: data.imageUrl || "",
      };
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  return [{ page: "1" }, { page: "2" }, { page: "3" }];
}

async function getProducts(category?: string, pageSize = 20): Promise<ProductData[]> {
  try {
    let q = query(collection(db, "products"), where("active", "==", true), fLimit(pageSize));
    if (category && category !== "all") {
      q = query(collection(db, "products"), where("active", "==", true), where("categoryId", "==", category), fLimit(pageSize));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name || "",
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
    });
  } catch {
    return [];
  }
}

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(undefined, 20),
  ]);

  return (
    <ProductsPageClient
      initialProducts={products}
      categories={categories}
    />
  );
}
