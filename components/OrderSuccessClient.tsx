"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebaseClient";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Truck,
  Hash,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Package,
  Printer,
} from "lucide-react";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

interface OrderData {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  deliveryAddress: string;
  deliveryOption: "delivery" | "pickup";
  items: OrderItem[];
  paymentMethod: string;
  paymentStatus: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  subtotal: number;
  deliveryCharge: number;
  handlingCharge: number;
  smallCartCharge: number;
  thirdPartyDeliveryCharge?: number;
  totalAmount: number;
  distanceKm?: number;
  isThirdPartyDelivery?: boolean;
  status: string;
  createdAt: string;
  date: string;
  areaCode?: string;
  estimatedDeliveryDate?: string;
}

export default function OrderSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setError("Please login to view your order.");
        setLoading(false);
        return;
      }

      if (!orderId) {
        setError("Invalid order ID.");
        setLoading(false);
        return;
      }

      try {
        const orderRef = doc(db, "users", user.uid, "orders", orderId);
        unsubscribeSnapshot = onSnapshot(
          orderRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setOrder(docSnap.data() as OrderData);
            } else {
              setError("Order not found. Please check your order ID.");
            }
            setLoading(false);
          },
          (err) => {
            console.error("Error listening to order:", err);
            setError("Failed to load order details. Please try again.");
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error setting up order listener:", err);
        setError("Failed to load order details. Please try again.");
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [orderId]);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generateInvoiceNumber = () => {
    if (!order?.createdAt) return "INV-000000";
    const date = new Date(order.createdAt);
    const yy = date.getFullYear().toString().slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const shortId = orderId.slice(-6).toUpperCase();
    return `INV-${yy}${mm}-${shortId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-red-100">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-section,
          #invoice-section * {
            visibility: visible;
          }
          #invoice-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          @page {
            margin: 15mm;
            size: A4;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-20">
        {showAnimation && (
          <div className="no-print fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
            <div className="bg-white rounded-3xl p-10 text-center shadow-2xl animate-bounce">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mt-6">Order Placed Successfully!</h2>
              <p className="text-gray-500 mt-2">Preparing your invoice...</p>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <button
            onClick={() => router.push("/")}
            className="no-print flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </button>

          <div className="no-print bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 md:p-8 mb-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Order Confirmed!</h1>
                <p className="text-emerald-100 mt-1">Thank you for your order. Your order has been placed successfully.</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="bg-white/15 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <Hash className="w-4 h-4" />
                Order ID: {orderId.slice(-8).toUpperCase()}
              </div>
              <div className="bg-white/15 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(order.createdAt || order.date)}
              </div>
              <div className="bg-white/15 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                {order.deliveryOption === "delivery" ? (
                  <Truck className="w-4 h-4" />
                ) : (
                  <Package className="w-4 h-4" />
                )}
                {order.deliveryOption === "delivery" ? "Home Delivery" : "Pickup"}
              </div>
            </div>
          </div>

          {/* Estimated Delivery & Tracking Link */}
          {order.estimatedDeliveryDate && (
            <div className="no-print bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <Truck className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800">Estimated Delivery</p>
                  <p className="text-amber-700 text-sm mt-1">
                    {formatDate(order.estimatedDeliveryDate)}
                  </p>
                  <button
                    onClick={() => router.push(`/orders/${orderId}`)}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl transition-colors"
                  >
                    <Truck className="w-4 h-4" /> Track Order
                  </button>
                </div>
              </div>
            </div>
          )}

          <div id="invoice-section" className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
              <div>
                <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <span>{order.deliveryAddress}</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-3xl bg-emerald-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-emerald-700 font-bold">Customer</p>
                    <p className="text-sm text-gray-900 font-semibold mt-2">{order.userName}</p>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      {order.userPhone}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      {order.userEmail}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-emerald-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-emerald-700 font-bold">Payment</p>
                    <p className="text-sm text-gray-900 font-semibold mt-2">{order.paymentMethod}</p>
                    <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      {order.paymentStatus}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-600" />
                      {order.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-gray-50 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500 font-bold">Invoice</p>
                <p className="text-lg font-bold text-gray-900 mt-3">{generateInvoiceNumber()}</p>
                <p className="text-sm text-gray-500 mt-1">Total Amount</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-3">₹{order.totalAmount}</p>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-bold text-gray-900">Items</h2>
              <div className="space-y-4 mt-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="grid grid-cols-[1fr_auto] gap-4 rounded-3xl bg-white border border-gray-100 p-4">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">₹{item.price}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>₹{order.subtotal}</p>
              </div>
              <div className="flex justify-between">
                <p>Delivery Charge</p>
                <p>₹{order.deliveryCharge}</p>
              </div>
              <div className="flex justify-between">
                <p>Handling Charge</p>
                <p>₹{order.handlingCharge}</p>
              </div>
              <div className="flex justify-between">
                <p>Small Cart Fee</p>
                <p>₹{order.smallCartCharge}</p>
              </div>
              {order.thirdPartyDeliveryCharge ? (
                <div className="flex justify-between">
                  <p>Extended delivery fee</p>
                  <p>₹{order.thirdPartyDeliveryCharge}</p>
                </div>
              ) : null}
            </div>

            <div className="mt-6 border-t border-gray-200 pt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-500">Delivered to</p>
                <p className="text-sm text-gray-900">{order.deliveryOption === "delivery" ? "Home" : "Store Pickup"}</p>
              </div>
              <button
                onClick={handlePrint}
                className="no-print inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition"
              >
                <Printer className="w-4 h-4" /> Print invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
