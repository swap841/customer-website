import { Suspense } from "react";
import OrderSuccessClient from "@/components/OrderSuccessClient";

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading order...</div>}>
      <OrderSuccessClient />
    </Suspense>
  );
}
