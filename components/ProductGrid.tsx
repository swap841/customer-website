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
    <>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          stockOverride={stockMap.get(product.id)}
        />
      ))}
    </>
  );
}
