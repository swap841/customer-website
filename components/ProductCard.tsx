"use client";

import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import Link from "next/link";
import { Plus, Minus, Heart, Star } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { getAuth } from "firebase/auth";

interface ProductCardProps {
  product: {
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
  };
}

function Stars({ average }: { average: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          className={s <= Math.round(average) ? "fill-amber-400 text-amber-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, removeFromCart, updateQuantity, cartItems } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const cartItem = cartItems.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const mrp = product.mrp || product.price;
  const isDiscounted = mrp > product.price;
  const discountPercent = isDiscounted ? Math.round(((mrp - product.price) / mrp) * 100) : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 1) updateQuantity(product.id, quantity - 1);
    else removeFromCart(product.id);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const user = getAuth().currentUser;
    if (!user) {
      toast.error("Sign in to add to wishlist");
      return;
    }
    await toggleWishlist(product.id);
    toast.success(isWishlisted(product.id) ? "Removed from wishlist" : "Added to wishlist");
  };

  const outOfStock = product.stock !== undefined && product.stock <= 0;

  return (
    <div className="w-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative">
      <Link href={`/products/${product.id}`} className="block w-full">
        <div className="relative h-40 sm:h-48 bg-gray-50">
          {isDiscounted && (
            <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md z-10">
              {discountPercent}% OFF
            </div>
          )}

          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition"
          >
            <Heart
              size={16}
              className={isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-gray-500"}
            />
          </button>

          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, 15rem"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
          )}

          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded">Sold Out</span>
            </div>
          )}

          {!outOfStock && (
            <div className="absolute bottom-2 right-2 z-10">
              {quantity === 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="bg-white text-emerald-600 font-bold px-4 py-2 rounded-md shadow-md border-2 border-emerald-500 hover:bg-emerald-50 transition-colors uppercase text-sm"
                >
                  ADD
                </button>
              ) : (
                <div className="flex items-center justify-between bg-emerald-500 text-white rounded w-20 sm:w-24 text-sm font-bold shadow-lg border-2 border-emerald-500">
                  <button onClick={handleDecrement} className="w-1/3 p-1 hover:bg-emerald-600"><Minus size={14} /></button>
                  <span className="w-1/3 text-center">{quantity}</span>
                  <button onClick={handleIncrement} className="w-1/3 p-1 hover:bg-emerald-600"><Plus size={14} /></button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-2 sm:p-3 pt-0">
          {product.rating && product.rating.count > 0 && (
            <div className="flex items-center gap-1 mt-2 mb-1">
              <Stars average={product.rating.average} />
              <span className="text-[10px] text-gray-400">({product.rating.count})</span>
            </div>
          )}

          <div className="flex items-center mt-1 mb-1">
            <span className="inline-flex items-center px-3 py-1 mr-2 rounded-xl bg-white shadow-md border border-green-200">
              <span className="text-xs sm:text-sm text-green-700 mr-1">₹</span>
              <span className="text-lg sm:text-xl font-extrabold text-green-700">{product.price}</span>
            </span>
            {isDiscounted && <span className="text-xs sm:text-sm text-gray-400 line-through">₹{mrp}</span>}
          </div>

          <h3 className="text-sm sm:text-base font-bold text-gray-800 leading-snug mb-1 line-clamp-2">
            {product.name}
          </h3>

          {product.weight != null && (
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              {product.weight}{product.unit || "g"}
            </p>
          )}

          {!outOfStock && product.stock !== undefined && product.stock <= (product.lowStockThreshold ?? 5) && (
            <p className="text-[10px] text-orange-600 font-semibold mt-1">Only {product.stock} left</p>
          )}
        </div>
      </Link>
    </div>
  );
}
