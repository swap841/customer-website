import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import type { Category } from "@/shared/models";

function mapDoc<T>(d: { id: string; data(): unknown }): T {
  return { id: d.id, ...(d.data() as object) } as T;
}

export interface CategoryWithCount extends Category {
  productCount: number;
}

export function useCategoriesWithCount() {
  return useQuery({
    queryKey: ["categories", "withCount"],
    queryFn: async () => {
      const catsSnap = await getDocs(
        query(collection(db, "categories"), where("active", "==", true))
      );
      const categories = catsSnap.docs.map((d) => mapDoc<Category>(d));

      const prodsSnap = await getDocs(
        query(collection(db, "products"), where("active", "==", true))
      );
      const countMap: Record<string, number> = {};
      for (const doc of prodsSnap.docs) {
        const data = doc.data();
        const catId = data.categoryId as string | undefined;
        if (catId) {
          countMap[catId] = (countMap[catId] || 0) + 1;
        }
      }

      return categories
        .map((cat) => ({ ...cat, productCount: countMap[cat.id] || 0 }))
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}
