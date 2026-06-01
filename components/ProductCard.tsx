"use client";

import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import Link from "next/link";
import { Plus, Minus, Heart, Star, ShoppingCart } from "lucide-react";
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
          className={s <= Math.round(average) ? "fill-amber-400 text-amber-400" : "text-slate-300"}
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
    <div className="stitch-card group cursor-pointer">
      <Link href={`/products/${product.id}`}>
        <div className="relative overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={400}
              height={400}
              className="product-image"
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center text-slate-400 bg-slate-50">No Image</div>
          )}

          {isDiscounted && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              {discountPercent}% OFF
            </span>
          )}

          {!outOfStock && product.stock !== undefined && product.stock < 10 && product.stock > 0 && (
            <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              Only {product.stock} left
            </span>
          )}

          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition"
          >
            <Heart
              size={16}
              className={isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-slate-500"}
            />
          </button>

          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded">Sold Out</span>
            </div>
          )}
        </div>

        <div className="p-4">
          {product.rating && product.rating.count > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-0.5">
                <Stars average={product.rating.average} />
                <span className="text-sm font-medium text-slate-700">{product.rating.average}</span>
              </div>
              <span className="text-xs text-slate-400">({product.rating.count})</span>
            </div>
          )}

          <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1">{product.name}</h3>

          {product.weight != null && (
            <p className="text-xs text-slate-400 mb-2">
              {product.weight}{product.unit || "g"}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-emerald-600">₹{product.price}</span>
              {isDiscounted && (
                <span className="text-sm text-slate-400 line-through ml-2">₹{mrp}</span>
              )}
            </div>

            {!outOfStock && (
              <>
                {quantity === 0 ? (
                  <button
                    onClick={handleAddToCart}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full transition-all active:scale-95"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="flex items-center bg-emerald-500 text-white rounded-lg overflow-hidden">
                    <button onClick={handleDecrement} className="p-2 hover:bg-emerald-600"><Minus size={14} /></button>
                    <span className="px-3 font-bold text-sm">{quantity}</span>
                    <button onClick={handleIncrement} className="p-2 hover:bg-emerald-600"><Plus size={14} /></button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
