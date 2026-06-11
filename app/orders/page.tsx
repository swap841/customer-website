"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import {
  ShoppingBag, Loader2, ArrowLeft, XCircle,
} from "lucide-react";
import { useContactInfo } from "@/hooks/useContactInfo";
import OrderCard from "@/components/OrderCard";
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

const CANCELLED_STATUSES = ["Cancelled"];

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [tab, setTab] = useState<"current" | "history">("current");
  const { contactInfo } = useContactInfo();
  const symbol = contactInfo.currencySymbol || "\u20B9";

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
    setLoading(true);

    const q = query(collection(db, "users", user.uid, "orders"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          status: data.status || "Pending",
          totalAmount: data.totalAmount || 0,
          items: (data.items || []).map((i: any) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
          createdAt: data.createdAt || data.date,
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
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const currentOrders = orders.filter(o => !CANCELLED_STATUSES.includes(o.status) && o.status !== "Delivered");
  const historyOrders = orders.filter(o => CANCELLED_STATUSES.includes(o.status) || o.status === "Delivered");

  const handleRemoveOrder = (orderId: string) => {
    const updatedOrders = orders.filter(o => o.id !== orderId);
    setOrders(updatedOrders);
    setTotalCount(updatedOrders.length);
  };

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

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("current")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              tab === "current" ? "bg-emerald-600 text-white shadow-md" : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            Current ({currentOrders.length})
          </button>
          <button
            onClick={() => setTab("history")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              tab === "history" ? "bg-emerald-600 text-white shadow-md" : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
            }`}
          >
            History ({historyOrders.length})
          </button>
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
        ) : tab === "current" ? (
          currentOrders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No current orders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentOrders.map((order) => (
                <OrderCard key={order.id} order={order} symbol={symbol} onCancel={handleRemoveOrder} />
              ))}
            </div>
          )
        ) : (
          historyOrders.length === 0 ? (
            <div className="text-center py-16">
              <XCircle className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No order history</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyOrders.map((order) => (
                <OrderCard key={order.id} order={order} symbol={symbol} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

