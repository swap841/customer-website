"use client";

import React from "react";
import { useCart } from "@/components/CartContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Percent, Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useContactInfo } from "@/hooks/useContactInfo";

const CartPage: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    totalItems,
    subtotal,
    deliveryCharge,
    taxAmount,
    grandTotal,
    couponCode,
    setCouponCode,
    couponDiscount,
    applyCoupon,
    couponMessage,
    couponLoading,
  } = useCart();

  const router = useRouter();
  const { contactInfo } = useContactInfo();
  const symbol = contactInfo.currencySymbol || "\u20B9";

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-5.98.572M7.5 14.25H18M18 14.25a3 3 0 005.98.572M18 14.25H7.5m0 0L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add items to get started</p>
          <button onClick={() => router.push("/products")} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 mb-4 transition">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Cart ({totalItems} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          {/* Cart Items */}
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-4 items-start shadow-sm">
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                  <Image src={item.imageUrl || "/images/placeholder.png"} alt={item.name} fill sizes="5rem" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-emerald-600 font-bold mt-1">{symbol}{item.price}</p>
                  {item.weight != null && <p className="text-xs text-gray-400">{item.weight}{item.unit || "g"}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center hover:bg-emerald-50 transition"><Minus size={14} /></button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 border border-gray-200 rounded-full flex items-center justify-center hover:bg-emerald-50 transition"><Plus size={14} /></button>
                    <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-500 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm h-fit sticky top-24">
            <h2 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-6 bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-2">
                <Percent size={16} className="text-emerald-600" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
                <button onClick={applyCoupon} disabled={couponLoading}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50">
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
              {couponMessage && <p className="text-xs mt-1 text-gray-600">{couponMessage}</p>}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-semibold">{symbol}{subtotal}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                {deliveryCharge === 0 ? (
                  <span className="text-blue-600 font-semibold">FREE</span>
                ) : <span className="font-semibold">{symbol}{deliveryCharge}</span>}
              </div>
              <div className="flex justify-between"><span className="text-gray-600">Tax</span><span className="font-semibold">{symbol}{taxAmount}</span></div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold"><span>Coupon discount</span><span>-{symbol}{couponDiscount}</span></div>
              )}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-emerald-600">{symbol}{grandTotal}</span></div>
              </div>
            </div>

            <button onClick={handleCheckout}
              className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md">
              PROCEED TO CHECKOUT — {symbol}{grandTotal}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
