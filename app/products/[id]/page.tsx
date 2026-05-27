"use client";

import { useParams } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";

export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-500">
        Loading product...
      </div>
    );
  }

  return <ProductDetailClient productId={id} />;
}