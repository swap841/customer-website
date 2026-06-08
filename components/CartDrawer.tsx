"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Percent, Minus, Plus, Trash2 } from "lucide-react";
import { getAuth, User, onAuthStateChanged } from "firebase/auth";
import { app } from "@/firebaseConfig";

const auth = getAuth(app);

const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    cartItems,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    subtotal,
    deliveryCharge,
    deliveryChargeConfig,
    taxAmount,
    grandTotal,
    couponCode,
    setCouponCode,
    couponDiscount,
    applyCoupon,
    couponMessage,
    couponLoading,
  } = useCart();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  const handleGoogleSignIn = async () => {
    const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
    await signInWithPopup(auth, new GoogleAuthProvider()).catch(() => {});
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={closeCart} />
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div>
            <h2 className="text-xl font-black text-zinc-800">My Cart</h2>
            <p className="text-sm text-gray-600">{totalItems} items</p>
          </div>
          <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-5.98.572M7.5 14.25H18M18 14.25a3 3 0 005.98.572M18 14.25H7.5m0 0L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
              </div>
              <p className="text-lg font-semibold text-gray-500">Your cart is empty</p>
              <p className="text-sm mt-1 text-gray-400">Add items to get started</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50/80 rounded-xl border border-gray-100 items-start">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                      <Image src={item.imageUrl || "/placeholder-product.png"} alt={item.name} fill sizes="4rem" className="object-cover rounded-md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.name}</h3>
                      <p className="text-green-600 font-semibold text-sm sm:text-base mt-0.5">₹{item.price}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-200 rounded-full text-sm hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-bold"><Minus size={14} /></button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-200 rounded-full text-sm hover:bg-emerald-50 hover:border-emerald-300 transition-colors font-bold"><Plus size={14} /></button>
                        <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-500 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mt-6 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-2">
                  <Percent size={16} className="text-emerald-600" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
                {couponMessage && <p className="text-xs mt-1 text-gray-600">{couponMessage}</p>}
              </div>

              {/* Bill details */}
              <div className="mt-6">
                <h3 className="font-bold text-lg mb-4 text-zinc-800">Bill details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Items total</span><span>₹{subtotal}</span></div>
                  <div className="flex justify-between">
                    <span>Delivery charge</span>
                    {deliveryCharge === 0 ? (
                      <span className="flex gap-2"><span className="line-through text-gray-400">₹{deliveryChargeConfig > 0 ? deliveryChargeConfig : 25}</span><span className="text-blue-600 font-semibold">FREE</span></span>
                    ) : <span>₹{deliveryCharge}</span>}
                  </div>
                  <div className="flex justify-between"><span>Tax</span><span>₹{taxAmount}</span></div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold"><span>Coupon discount</span><span>-₹{couponDiscount}</span></div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-4 border-t mt-4">
                    <span>Grand total</span>
                    <span className="text-emerald-600">₹{grandTotal}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-4 sm:p-6 border-t">
            {loading ? (
              <div className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold text-center">Checking sign-in...</div>
            ) : user ? (
              <button onClick={handleCheckout} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md">
                PROCEED TO CHECKOUT — ₹{grandTotal}
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">Sign in to checkout</p>
                <button onClick={handleGoogleSignIn} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md">
                  SIGN IN TO CONTINUE
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
