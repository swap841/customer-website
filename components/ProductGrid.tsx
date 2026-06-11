"use client";

import ProductCard from "@/components/ProductCard";
import { useBatchStock } from "@/hooks/useBatchStock";

interface ProductData {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  discountPercentage?: number;
  imageUrl?: string;
  weight?: number;
  unit?: string;
  stock?: number;
  categoryId?: string;
  lowStockThreshold?: number;
  rating?: { average: number; count: number };
}

export default function ProductGrid({ products }: { products: ProductData[] }) {
  const ids = products.map((p) => p.id);
  const stockMap = useBatchStock(ids);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          stockOverride={stockMap.get(product.id)}
        />
      ))}
    </div>
  );
}
