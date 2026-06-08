import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import type { Category } from "@/shared/models";

function mapDoc<T>(d: { id: string; data(): unknown }): T {
  return { id: d.id, ...(d.data() as object) } as T;
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const q = query(collection(db, "categories"), where("active", "==", true));
      const snap = await getDocs(q);
      const cats = snap.docs.map((d) => mapDoc<Category>(d));
      return cats.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCategoryByName(name: string) {
  return useQuery({
    queryKey: ["category", name],
    queryFn: async () => {
      if (!name) return null;
      const q = query(collection(db, "categories"), where("name", "==", name), where("active", "==", true));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return mapDoc<Category>(snap.docs[0]);
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    enabled: !!name,
  });
}
