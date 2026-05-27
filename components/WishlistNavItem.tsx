"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

export default function WishlistNavItem() {
  const { wishlistIds } = useWishlist();

  return (
    <Link
      href="/wishlist"
      className="relative flex items-center gap-1 px-2 py-1.5 rounded-xl text-sm font-semibold text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
    >
      <Heart size={18} className={wishlistIds.length > 0 ? "fill-red-500 text-red-500" : ""} />
      {wishlistIds.length > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {wishlistIds.length}
        </span>
      )}
    </Link>
  );
}
