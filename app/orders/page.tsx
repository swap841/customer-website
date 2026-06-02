"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import {
  Package, Clock, Truck, CheckCircle2, AlertCircle, XCircle,
  ChevronRight, Loader2, Hash, IndianRupee, ShoppingBag, Calendar, ArrowLeft, ShieldCheck,
} from "lucide-react";
import Link from "next/link";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
  createdAt: any;
  estimatedDeliveryDate?: string;
  payment?: { method: string };
  address?: { name: string };
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  Pending: { color: "text-amber-700", bg: "bg-amber-100", icon: Clock },
  Packing: { color: "text-orange-700", bg: "bg-orange-100", icon: Package },
  "Ready to Dispatch": { color: "text-blue-700", bg: "bg-blue-100", icon: Package },
  Assigned: { color: "text-indigo-700", bg: "bg-indigo-100", icon: Truck },
  Accepted: { color: "text-teal-700", bg: "bg-teal-100", icon: Truck },
  "Out for Delivery": { color: "text-cyan-700", bg: "bg-cyan-100", icon: Truck },
  "Awaiting Verification": { color: "text-purple-700", bg: "bg-purple-100", icon: ShieldCheck },
  Delivered: { color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle2 },
  Cancelled: { color: "text-red-700", bg: "bg-red-100", icon: XCircle },
};

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthChecking(false);
      if (u) setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    loadOrders();
  }, [user]);

  async function loadOrders() {
    if (!user) return;
    setLoading(true);

    try {
      const q = query(collection(db, "users", user.uid, "orders"));
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => {
        const data = d.data();
        const createdVal = data.createdAt || data.date;
        return {
          id: d.id,
          status: data.status || "Pending",
          totalAmount: data.totalAmount || 0,
          items: (data.items || []).map((i: any) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          createdAt: createdVal,
          estimatedDeliveryDate: data.estimatedDeliveryDate,
          payment: data.payment,
          address: data.deliveryAddress || data.address,
        } as Order;
      });
      items.sort((a, b) => {
        const da = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
      setOrders(items);
      setTotalCount(items.length);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  }

  if (authChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
          <p className="text-gray-500 mt-3 font-medium">
            {authChecking ? "Loading..." : "Please sign in to view orders"}
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (d: any) => {
    if (!d) return "N/A";
    try {
      let dateObj: Date;
      if (d?.toDate) {
        dateObj = d.toDate();
      } else if (d?.seconds) {
        dateObj = new Date(d.seconds * 1000);
      } else {
        dateObj = new Date(d);
      }
      return dateObj.toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-12">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push("/profile")} className="p-2 hover:bg-zinc-100 rounded-xl transition">
            <ArrowLeft className="w-5 h-5 text-zinc-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-zinc-900">My Orders</h1>
            <p className="text-sm text-zinc-500">{totalCount} order{totalCount !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center shadow-sm">
            <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-zinc-700 mb-2">No orders yet</h2>
            <p className="text-sm text-zinc-500 mb-6">Start shopping to see your orders here</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-md"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
              const StatusIcon = cfg.icon;
              const itemSummary = order.items.slice(0, 3).map((i) => i.name).join(", ");
              const extra = order.items.length > 3 ? ` +${order.items.length - 3} more` : "";

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-md hover:border-emerald-200 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                        <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
                          {order.status}
                        </span>
                        <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                          <Hash className="w-3 h-3" /> {order.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-300 shrink-0 mt-1" />
                  </div>
                  <p className="text-xs text-zinc-600 line-clamp-1 mb-2">{itemSummary}{extra}</p>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />{order.totalAmount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{formatDate(order.createdAt)}
                      </span>
                    </div>
                    {order.payment?.method && (
                      <span className="text-[10px] uppercase font-bold text-zinc-400">{order.payment.method}</span>
                    )}
                  </div>
                </Link>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}
