"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useReviews, addReview } from "@/hooks/useReviews";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import Link from "next/link";
import { getAuth } from "firebase/auth";
import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Minus,
  Tag,
  ShoppingBag,
  ChevronRight,
  Heart,
  Star,
  User,
  MessageSquare,
  ChevronLeft,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type { StoreConfig } from "@/lib/defaultConfig";
import ProductStock from "@/components/ProductStock";

interface ProductData {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  imageUrl: string;
  images?: string[];
  weight: number;
  unit: string;
  description: string;
  stock: number;
  lowStockThreshold: number;
  categoryId: string;
  active: boolean;
  rating?: { average: number; count: number };
}

export default function ProductDetail({
  product,
  relatedProducts,
  config,
}: {
  product: ProductData;
  relatedProducts: ProductData[];
  config: StoreConfig;
}) {
  const router = useRouter();
  const symbol = config.currencySymbol || "\u20B9";
  const { addToCart, updateQuantity, cartItems } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { reviews } = useReviews(product.id);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);

  const productImages = product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];
  const THUMBNAIL_LIMIT = 4;

  const cartItem = cartItems.find((item) => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const mrp = product.mrp || product.price;
  const discountPercent = mrp > product.price ? Math.round(((mrp - product.price) / mrp) * 100) : 0;

  const handleWishlist = async () => {
    const user = getAuth().currentUser;
    if (!user) { toast.error("Sign in to add to wishlist"); return; }
    await toggleWishlist(product.id);
    toast.success(isWishlisted(product.id) ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getAuth().currentUser;
    if (!user) { toast.error("Sign in to write a review"); return; }
    setSubmittingReview(true);
    try {
      await addReview(product.id, reviewRating, reviewComment);
      toast.success("Review submitted!");
      setReviewComment("");
      setReviewRating(5);
    } catch { toast.error("Failed to submit review"); }
    finally { setSubmittingReview(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium">
          <Link href="/products" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-400">{product.categoryId}</span>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-800 font-semibold truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-4 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <div className="relative">
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl shadow-lg z-10">
                  <Tag className="w-3.5 h-3.5 inline mr-1" />{discountPercent}% OFF
                </div>
              )}
              <button onClick={handleWishlist}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition"
              >
                <Heart size={20} className={isWishlisted(product.id) ? "fill-red-500 text-red-500" : "text-gray-500"} />
              </button>

              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50 aspect-square">
                {productImages.length > 0 ? (
                  <Image src={productImages[selectedImageIndex]} alt={product.name} fill priority className="object-contain p-4 transition-opacity" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">No image</div>
                )}

                {productImages.length > 1 && (
                  <>
                    <button onClick={() => setSelectedImageIndex(i => (i - 1 + productImages.length) % productImages.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition">
                      <ChevronLeft className="w-4 h-4 text-gray-700" />
                    </button>
                    <button onClick={() => setSelectedImageIndex(i => (i + 1) % productImages.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition">
                      <ChevronRight className="w-4 h-4 text-gray-700" />
                    </button>
                  </>
                )}

                {productImages.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {selectedImageIndex + 1}/{productImages.length}
                  </div>
                )}
              </div>

              {productImages.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {productImages.slice(0, showAllImages ? productImages.length : THUMBNAIL_LIMIT).map((img, idx) => (
                    <button key={idx} onClick={() => setSelectedImageIndex(idx)}
                      className={`shrink-0 w-14 h-14 rounded-xl border-2 overflow-hidden transition-all ${
                        idx === selectedImageIndex ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-gray-200 hover:border-gray-300"
                      }`}>
                      <Image src={img} alt="" width={56} height={56} className="object-cover w-full h-full" />
                    </button>
                  ))}
                  {!showAllImages && productImages.length > THUMBNAIL_LIMIT && (
                    <button onClick={() => setShowAllImages(true)}
                      className="shrink-0 w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-500 hover:bg-gray-100 transition">
                      +{productImages.length - THUMBNAIL_LIMIT}
                    </button>
                  )}
                  {showAllImages && productImages.length > THUMBNAIL_LIMIT && (
                    <button onClick={() => setShowAllImages(false)}
                      className="shrink-0 w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition">
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {product.categoryId && (
                  <span className="text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wide w-fit block">
                    {product.categoryId}
                  </span>
                )}

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                  {product.name}
                </h1>

                {product.rating && product.rating.count > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={18}
                          className={s <= Math.round(product.rating!.average) ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{product.rating.average.toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({product.rating.count} reviews)</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium">
                  <span>Weight: <strong className="text-gray-800">{product.weight}{product.unit}</strong></span>
                  <span className="h-3 w-px bg-gray-300" />
                  <ProductStock productId={product.id} initialStock={product.stock} lowStockThreshold={product.lowStockThreshold} />
                </div>

                <div className="bg-gradient-to-r from-emerald-50/50 via-teal-50/20 to-transparent p-4 rounded-2xl border border-emerald-100/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-emerald-700">{symbol}{product.price}</span>
                      {mrp > product.price && <span className="text-base text-gray-400 line-through">{symbol}{mrp}</span>}
                    </div>
                    {discountPercent > 0 && <p className="text-sm text-emerald-600">Save {discountPercent}% today</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="font-semibold text-gray-900">{quantity || 0} in cart</p>
                    </div>
                    <ProductStock productId={product.id} initialStock={product.stock}>
                      {(currentStock) => {
                        const outOfStock = currentStock <= 0;
                        return !outOfStock ? (
                          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1">
                            <button onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))} className="h-9 w-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"><Minus className="w-4 h-4" /></button>
                            <span className="min-w-[32px] text-center font-semibold">{quantity}</span>
                            <button onClick={() => updateQuantity(product.id, quantity + 1)} className="h-9 w-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition"><Plus className="w-4 h-4" /></button>
                          </div>
                        ) : null;
                      }}
                    </ProductStock>
                  </div>
                  <ProductStock productId={product.id} initialStock={product.stock}>
                    {(currentStock) => {
                      const outOfStock = currentStock <= 0;
                      return (
                        <button onClick={() => addToCart(product)}
                          disabled={outOfStock}
                          className="mt-4 w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                          {outOfStock ? "Sold Out" : quantity === 0 ? "Add to Cart" : "Add More"}
                        </button>
                      );
                    }}
                  </ProductStock>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-5">
                  <h2 className="text-sm font-semibold text-gray-800">Product details</h2>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{product.description}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-emerald-600" />
              Reviews ({reviews.length})
            </h2>

            <div className="mt-6 space-y-4 max-w-2xl">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm font-semibold text-gray-800">{review.userName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className={s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleReviewSubmit} className="mt-8 max-w-2xl bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">Write a Review</h3>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setReviewRating(s)}>
                    <Star size={24} className={s <= reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                  </button>
                ))}
              </div>
              <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..." required rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500 resize-none bg-white"
              />
              <button type="submit" disabled={submittingReview || !reviewComment.trim()}
                className="mt-3 bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-700 font-bold">You may also like</p>
                  <h2 className="text-xl font-bold text-gray-900">Related groceries</h2>
                </div>
                <Link href="/products" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">See all</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {relatedProducts.map((related) => (
                  <ProductCard key={related.id} product={related} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
