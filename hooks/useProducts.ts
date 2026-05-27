import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, limit, doc, getDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import type { Product } from "../../shared/models";

function mapDoc<T>(d: { id: string; data(): unknown }): T {
  return { id: d.id, ...(d.data() as object) } as T;
}

export function useProducts(limitCount = 20) {
  return useQuery({
    queryKey: ["products", limitCount],
    queryFn: async () => {
      const q = query(collection(db, "products"), where("active", "==", true), limit(limitCount));
      const snap = await getDocs(q);
      return snap.docs.map((d) => mapDoc<Product>(d));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) return null;
      const snap = await getDoc(doc(db, "products", id));
      if (!snap.exists()) return null;
      return mapDoc<Product>(snap);
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

export function useProductsByCategory(categoryId: string) {
  return useQuery({
    queryKey: ["products", "category", categoryId],
    queryFn: async () => {
      const q = query(collection(db, "products"), where("categoryId", "==", categoryId), where("active", "==", true));
      const snap = await getDocs(q);
      return snap.docs.map((d) => mapDoc<Product>(d));
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!categoryId,
  });
}

export function useSearchProducts(searchTerm: string) {
  return useQuery({
    queryKey: ["products", "search", searchTerm],
    queryFn: async () => {
      const q = query(collection(db, "products"), where("active", "==", true), orderBy("name"), limit(50));
      const snap = await getDocs(q);
      const all = snap.docs.map((d) => mapDoc<Product>(d));
      if (!searchTerm) return all;
      const lower = searchTerm.toLowerCase();
      return all.filter(
        (p) =>
          p.name?.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower)
      );
    },
    staleTime: 2 * 60 * 1000,
    enabled: searchTerm.length > 0,
  });
}
