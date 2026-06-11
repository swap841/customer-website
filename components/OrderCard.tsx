"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package, Clock, Truck, CheckCircle2, AlertCircle, XCircle,
  ChevronRight, Hash, Calendar, ShoppingBag, MoreVertical, ShieldCheck,
} from "lucide-react";
import { getAuth } from "firebase/auth";
import { canCancelOrder } from "@/lib/cancellationRules";
import { toast } from "sonner";

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

interface Props {
  order: Order;
  symbol: string;
  onCancel?: (orderId: string) => void;
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

export default function OrderCard({ order, symbol, onCancel }: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const createdDate = order.createdAt?.toDate
    ? order.createdAt.toDate()
    : order.createdAt?.seconds
    ? new Date(order.createdAt.seconds * 1000)
    : new Date(order.createdAt || Date.now());

  const cancelCheck = canCancelOrder(order.status, createdDate);
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
  const StatusIcon = cfg.icon;
  const itemSummary = order.items.slice(0, 3).map(i => i.name).join(", ");
  const extra = order.items.length > 3 ? ` +${order.items.length - 3} more` : "";

  const handleCancel = async () => {
    if (cancelling) return;
    setCancelling(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderId: order.id, userId: getAuth().currentUser?.uid }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order cancelled successfully");
        setMenuOpen(false);
        setConfirmCancel(false);
        if (onCancel) onCancel(order.id);
      } else {
        toast.error(data.error || "Failed to cancel order");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const isPaid = order.payment?.method === "online" || order.payment?.method === "razorpay";

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5 hover:shadow-md hover:border-emerald-200 transition-all shadow-sm relative">
      <div className="flex items-start justify-between mb-3">
        <Link href={`/orders/${order.id}`} className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
            <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
          </div>
          <div className="min-w-0">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
              {order.status}
            </span>
            <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
              <Hash className="w-3 h-3" /> {order.id.slice(-8).toUpperCase()}
            </p>
          </div>
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 hover:bg-zinc-100 rounded-lg transition"
          >
            <MoreVertical className="w-5 h-5 text-zinc-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white border border-zinc-200 rounded-xl shadow-lg z-20 w-44 py-1">
              <Link
                href={`/orders/${order.id}`}
                className="block px-4 py-2.5 text-xs font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                onClick={() => setMenuOpen(false)}
              >
                View Details
              </Link>
              {cancelCheck.allowed && (
                <button
                  onClick={() => { setConfirmCancel(true); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                >
                  Cancel Order
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Link href={`/orders/${order.id}`} className="block">
        <p className="text-xs text-zinc-600 line-clamp-1 mb-2">{itemSummary}{extra}</p>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold text-zinc-800">
              {symbol}{order.totalAmount}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />{createdDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          {order.payment?.method && (
            <span className="text-[10px] uppercase font-bold text-zinc-400">{order.payment.method}</span>
          )}
        </div>
      </Link>

      {confirmCancel && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900">Cancel Order?</h3>
              <p className="text-sm text-gray-500 mt-2">
                {isPaid
                  ? "Refund will be processed within 5-7 business days."
                  : "No payment will be deducted."}
              </p>
              {!cancelCheck.allowed && (
                <p className="text-xs text-red-500 mt-2">{cancelCheck.reason}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCancel(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling || !cancelCheck.allowed}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
