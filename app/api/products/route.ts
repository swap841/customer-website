import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, query, where, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limitCount = parseInt(searchParams.get("limit") || "20");
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const lastDocId = searchParams.get("lastDocId") || "";
  const cursor = searchParams.get("cursor") || "";

  try {
    let q;

    if (cursor) {
      const { doc, getDoc } = await import("firebase/firestore");
      const cursorSnap = await getDoc(doc(db, "products", cursor));
      if (!cursorSnap.exists()) {
        return NextResponse.json({ products: [], hasMore: false });
      }
      let base = query(collection(db, "products"), where("active", "==", true));
      if (category) {
        base = query(base, where("categoryId", "==", category));
      }
      if (search) {
        base = query(base, orderBy("name"), startAfter(search), limit(limitCount + 1));
      } else {
        base = query(base, orderBy("name"), startAfter(cursorSnap), limit(limitCount + 1));
      }
      q = base;
    } else {
      let base = query(collection(db, "products"), where("active", "==", true));
      if (category) {
        base = query(base, where("categoryId", "==", category));
      }
      base = query(base, limit(limitCount + 1));
      q = base;
    }

    const snap = await getDocs(q);
    const products = snap.docs.slice(0, limitCount).map((d) => ({
      id: d.id,
      name: d.data().name || "",
      price: d.data().price || 0,
      mrp: d.data().mrp || d.data().price,
      imageUrl: d.data().imageUrl || "",
      images: d.data().images || [],
      weight: d.data().weight || 0,
      unit: d.data().unit || "g",
      description: d.data().description || "",
      stock: d.data().stock ?? 0,
      lowStockThreshold: d.data().lowStockThreshold ?? 5,
      categoryId: d.data().categoryId || "",
      active: d.data().active !== false,
      rating: d.data().rating || { average: 0, count: 0 },
    }));

    const hasMore = snap.docs.length > limitCount;

    return NextResponse.json({ products, hasMore, nextCursor: hasMore && products.length > 0 ? products[products.length - 1].id : "" });
  } catch (err) {
    console.error("[API] Products fetch error:", err);
    return NextResponse.json({ products: [], hasMore: false, error: "Failed to fetch products" }, { status: 500 });
  }
}
