"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
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
  Store,
  Clock,
} from "lucide-react";
import { useContactInfo } from "@/hooks/useContactInfo";

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
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  address?: { name?: string; phone?: string; [key: string]: unknown };
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
  createdAt: string | Timestamp;
  date: string | Timestamp;
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
  const { contactInfo } = useContactInfo();
  const symbol = contactInfo.currencySymbol || "\u20B9";

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
          () => {
            setError("Failed to load order details. Please try again.");
            setLoading(false);
          }
        );
      } catch {
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

  const toDate = (val: string | Timestamp | undefined): Date => {
    if (!val) return new Date();
    if (val && typeof val === "object" && "toDate" in val) return val.toDate();
    return new Date(val as string);
  };

  const formatDate = (dateVal: string | Timestamp | undefined) => {
    const date = toDate(dateVal);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateVal: string | Timestamp | undefined) => {
    const date = toDate(dateVal);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generateInvoiceNumber = () => {
    if (!order?.createdAt) return "INV-000000";
    const date = toDate(order.createdAt);
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

  const isDelivery = order.deliveryOption === "delivery";
  const hasCharges = (order.handlingCharge ?? 0) > 0 || (order.smallCartCharge ?? 0) > 0;

  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-section, #invoice-section * { visibility: visible; }
          #invoice-section { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
          @page { margin: 15mm; size: A4; }
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-20">
        {showAnimation && (
          <div className="no-print fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
            <div className="bg-white rounded-3xl p-10 text-center shadow-2xl animate-bounce">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
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

          {/* ── Success Banner ── */}
          <div className="no-print bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 md:p-8 mb-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Order Confirmed!</h1>
                <p className="text-emerald-100 mt-1">Thank you for your order. It has been placed successfully.</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="bg-white/15 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <Hash className="w-4 h-4" />
                #{orderId.slice(-8).toUpperCase()}
              </span>
              <span className="bg-white/15 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatShortDate(order.createdAt || order.date)}
              </span>
              <span className="bg-white/15 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                {isDelivery ? <Truck className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                {isDelivery ? "Home Delivery" : "Store Pickup"}
              </span>
              <span className="bg-white/15 rounded-lg px-3 py-1.5 flex items-center gap-1.5 capitalize">
                <CreditCard className="w-4 h-4" />
                {order.paymentMethod} · {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* ── Delivery / Pickup Info ── */}
          <div className="no-print mb-6">
            {isDelivery ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Truck className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-amber-800">Estimated Delivery</p>
                    <p className="text-amber-700 text-sm mt-1">
                      {order.estimatedDeliveryDate
                        ? formatShortDate(order.estimatedDeliveryDate)
                        : "We'll notify you once assigned"}
                    </p>
                    <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {order.deliveryAddress}
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
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Store className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-blue-800">Store Pickup</p>
                    <p className="text-blue-700 text-sm mt-1">
                      {order.deliveryAddress || "Pick up from our store"}
                    </p>
                    <p className="text-blue-600 text-xs mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pickup Hours: 9:00 AM – 9:00 PM
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Invoice Card ── */}
          <div id="invoice-section" className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
            {/* Top row: customer + invoice */}
            <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
              <div className="space-y-4">
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs uppercase tracking-widest text-emerald-700 font-bold">Customer</p>
                  <p className="text-sm text-gray-900 font-semibold mt-2">
                    {order.userName || order.address?.name || "—"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    {order.userPhone || order.address?.phone || "—"}
                  </p>
                  {order.userEmail && (
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      {order.userEmail}
                    </p>
                  )}
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs uppercase tracking-widest text-emerald-700 font-bold">Payment</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900 uppercase">{order.paymentMethod}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : order.paymentStatus === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  {order.razorpayPaymentId && (
                    <p className="text-xs text-gray-500 mt-1">Ref: {order.razorpayPaymentId}</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-5 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Invoice</p>
                <p className="text-base font-bold text-gray-900 mt-2">{generateInvoiceNumber()}</p>
                <p className="text-sm text-gray-500 mt-3">Total Amount</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1">{symbol}{order.totalAmount}</p>
              </div>
            </div>

            {/* Items */}
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">Items Ordered</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Package className="w-5 h-5 text-emerald-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 shrink-0">
                      {symbol}{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Charges Breakdown */}
            <div className="mt-6 border-t border-gray-200 pt-5 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <p>Subtotal ({order.items.reduce((s, i) => s + i.quantity, 0)} items)</p>
                <p className="font-medium">{symbol}{order.subtotal}</p>
              </div>
              {order.deliveryCharge > 0 && (
                <div className="flex justify-between text-gray-600">
                  <p>Delivery Charge</p>
                  <p className="font-medium">{symbol}{order.deliveryCharge}</p>
                </div>
              )}
              {order.deliveryCharge === 0 && isDelivery && (
                <div className="flex justify-between text-green-600">
                  <p>Delivery Charge</p>
                  <p className="font-medium">FREE</p>
                </div>
              )}
              {(order.handlingCharge ?? 0) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <p>Handling Charge</p>
                  <p className="font-medium">{symbol}{order.handlingCharge}</p>
                </div>
              )}
              {(order.smallCartCharge ?? 0) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <p>Small Cart Fee</p>
                  <p className="font-medium">{symbol}{order.smallCartCharge}</p>
                </div>
              )}
              {(order.thirdPartyDeliveryCharge ?? 0) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <p>Extended Delivery Fee</p>
                  <p className="font-medium">{symbol}{order.thirdPartyDeliveryCharge}</p>
                </div>
              )}
              <div className="flex justify-between text-gray-900 font-bold text-base pt-2 border-t border-gray-200">
                <p>Total</p>
                <p>{symbol}{order.totalAmount}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 border-t border-gray-200 pt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {isDelivery ? <Truck className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                <span>{isDelivery ? `Delivered to ${order.deliveryAddress}` : "Ready for store pickup"}</span>
              </div>
              <button
                onClick={handlePrint}
                className="no-print inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
