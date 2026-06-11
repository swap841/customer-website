"use client";

import { useCart } from "@/components/CartContext";
import { useConfig } from "@/hooks/useConfig";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function FreeDeliveryBar() {
  const { subtotal } = useCart();
  const config = useConfig();

  const symbol = config.currencySymbol || "\u20B9";
  const freeDeliveryAbove = config.freeDeliveryAbove || 100;
  const remaining = Math.max(0, freeDeliveryAbove - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeDeliveryAbove) * 100);
  const isFreeDelivery = subtotal >= freeDeliveryAbove;

  return (
    <div className="mt-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 sm:p-8 text-white shadow-xl shadow-emerald-500/25">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide opacity-90">Free delivery</p>
            {isFreeDelivery ? (
              <p className="text-xs opacity-75">You have free delivery!</p>
            ) : (
              <p className="text-xs opacity-75">
                Add {symbol}{remaining} more for free delivery
              </p>
            )}
          </div>
        </div>
        <Link
          href="/products"
          className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-emerald-700 shadow-sm hover:bg-gray-50 transition"
        >
          Start shopping
        </Link>
      </div>
      <div className="mt-4 w-full bg-white/20 rounded-full h-2 overflow-hidden">
        <div
          className="bg-white h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
