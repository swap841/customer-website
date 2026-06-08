"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot, collection, addDoc, setDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebaseClient";
import { toast } from "sonner";
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Loader2,
  MapPin,
  Calendar,
  IndianRupee,
  Hash,
  ChevronLeft,
  Star,
  MessageSquare,
  RotateCcw,
  Send,
  Bug,
  ShieldCheck,
} from "lucide-react";


const ORDER_STEPS = [
  { key: "Pending", label: "Order Placed", icon: Package },
  { key: "Packing", label: "Packing", icon: Clock },
  { key: "Ready to Dispatch", label: "Ready to Dispatch", icon: Package },
  { key: "Assigned", label: "Assigned", icon: Truck },
  { key: "Accepted", label: "Accepted", icon: Clock },
  { key: "Out for Delivery", label: "Out for Delivery", icon: Truck },
  { key: "Awaiting Verification", label: "Awaiting Verification", icon: ShieldCheck },
  { key: "Delivered", label: "Delivered", icon: CheckCircle2 },
];

const STATUS_ORDER = [
  "Pending", "Packing", "Ready to Dispatch",
  "Assigned", "Accepted", "Out for Delivery", "Awaiting Verification", "Delivered", "Cancelled"
];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnSubmitted, setReturnSubmitted] = useState(false);
  const [problemType, setProblemType] = useState("defective");
  const [problemMessage, setProblemMessage] = useState("");
  const [problemLoading, setProblemLoading] = useState(false);
  const [problemSubmitted, setProblemSubmitted] = useState(false);
  const [ticketContact, setTicketContact] = useState<any>(null);
  const [ticketLoading, setTicketLoading] = useState(true);
  const [ticketReplyText, setTicketReplyText] = useState("");
  const [ticketReplying, setTicketReplying] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setError("Please sign in to view your order");
        setLoading(false);
        return;
      }
      setUser(u);

      const unsubOrder = onSnapshot(
        doc(db, "users", u.uid, "orders", orderId),
        (snap) => {
          if (snap.exists()) {
            setOrder({ id: snap.id, ...snap.data() });
            setError(null);
          } else {
            setError("Order not found");
          }
          setLoading(false);
        },
        () => {
          setError("Failed to load order");
          setLoading(false);
        }
      );

      return () => unsubOrder();
    });

    return () => unsubAuth();
  }, [orderId]);

  useEffect(() => {
    if (!order?.ticketContactId) {
      setTicketLoading(false);
      return;
    }
    const unsub = onSnapshot(
      doc(db, "contacts", order.ticketContactId),
      (snap) => {
        if (snap.exists()) {
          setTicketContact({ id: snap.id, ...snap.data() });
        }
        setTicketLoading(false);
      },
      () => {
        setTicketLoading(false);
      }
    );
    return unsub;
  }, [order?.ticketContactId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
          <p className="text-gray-500 mt-3 font-medium">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-red-100">
          <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">Order Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button onClick={() => router.push("/")} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = order.status || "Pending";
  const isCancelled = currentStatus === "Cancelled";
  const isAwaitingVerification = currentStatus === "Awaiting Verification";
  const currentStepIndex = STATUS_ORDER.indexOf(currentStatus);

  const formatDate = (d: string) => {
    if (!d) return "N/A";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-12">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={() => router.push("/profile")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 mb-4 transition">
          <ChevronLeft className="w-4 h-4" /> Back to Orders
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Order Status</h1>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Hash className="w-3 h-3" /> {orderId.slice(-8).toUpperCase()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              isCancelled ? "bg-red-100 text-red-700" :
              currentStatus === "Delivered" ? "bg-emerald-100 text-emerald-700" :
              "bg-amber-100 text-amber-700"
            }`}>
              {currentStatus}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Ordered: {formatDate(order.createdAt)}</span>
          </div>

          {order.estimatedDeliveryDate && !isCancelled && (
            <div className="mt-3 bg-emerald-50 rounded-xl p-3 flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs text-emerald-700 font-bold uppercase tracking-wide">Estimated Delivery</p>
                <p className="text-sm font-bold text-emerald-800">
                  {formatDate(order.estimatedDeliveryDate)}
                </p>
              </div>
            </div>
          )}

          {!isCancelled && (currentStatus === "Pending" || currentStatus === "Packing") && (
            <button
              onClick={async () => {
                const confirmed = window.confirm("Are you sure you want to cancel this order? Your items will be restocked and a refund will be initiated if paid online.");
                if (!confirmed) return;
                try {
                  const token = await getAuth().currentUser?.getIdToken();
                  const res = await fetch("/api/orders/cancel", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ orderId, userId: user?.uid }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    toast.success("Order cancelled successfully");
                  } else {
                    toast.error(data.error || "Failed to cancel order");
                  }
                } catch {
                  toast.error("Network error. Please try again.");
                }
              }}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 text-white px-4 py-2.5 text-sm font-bold hover:bg-red-600 transition shadow-sm"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Verification Code Display */}
        {isAwaitingVerification && order.verificationCode && (
          <div className="bg-emerald-600 rounded-2xl p-6 mb-4 text-center shadow-lg">
            <ShieldCheck className="w-8 h-8 text-emerald-200 mx-auto mb-2" />
            <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Delivery Verification Code</p>
            <p className="text-4xl font-black text-white tracking-[0.25em] select-all">
              {order.verificationCode}
            </p>
            <p className="text-emerald-200 text-xs mt-2">Share this code with the delivery person to confirm delivery</p>
          </div>
        )}

        {!isCancelled ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <div className="relative">
              {ORDER_STEPS.map((step, idx) => {
                const stepOrderIdx = STATUS_ORDER.indexOf(step.key);
                const isCompleted = stepOrderIdx <= currentStepIndex && !isCancelled;
                const isCurrent = step.key === currentStatus;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex items-start gap-3 pb-6 relative last:pb-0">
                    {idx < ORDER_STEPS.length - 1 && (
                      <div className={`absolute left-[15px] top-8 w-0.5 h-full -z-0 ${
                        isCompleted ? "bg-emerald-500" : "bg-gray-200"
                      }`} />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      isCompleted ? "bg-emerald-500 text-white" :
                      isCurrent ? "bg-emerald-100 text-emerald-600 border-2 border-emerald-500" :
                      "bg-gray-100 text-gray-400"
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="pt-1">
                      <p className={`text-sm font-bold ${
                        isCompleted ? "text-emerald-700" :
                        isCurrent ? "text-gray-900" :
                        "text-gray-400"
                      }`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-gray-400 mt-0.5">Current</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <p className="font-bold text-red-800">Order Cancelled</p>
                {order.cancelReason && (
                  <p className="text-sm text-red-600 mt-0.5">Reason: {order.cancelReason}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Items</h2>
          <div className="space-y-3">
            {(order.items || []).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">₹{item.price}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Total Amount</span>
              <span className="font-bold text-gray-900">₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Payment</span>
              <span className="font-medium">{order.payment?.method?.toUpperCase() || "COD"}</span>
            </div>
          </div>
        </div>

        {order.address && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" /> Delivery Address
            </h2>
            <p className="text-sm text-gray-700 font-medium">{order.address.name}</p>
            <p className="text-sm text-gray-500">{order.address.phone}</p>
            <p className="text-sm text-gray-500 mt-1">{order.address.addressLine}</p>
            {order.address.city && (
              <p className="text-sm text-gray-500">{order.address.city} - {order.address.pincode}</p>
            )}
            {order.outOfCity && (
              <div className="mt-3 bg-amber-50 rounded-lg p-2.5 text-xs text-amber-700">
                Extended delivery area — additional charges may apply
              </div>
            )}
          </div>
        )}

        {currentStatus === "Delivered" && !reviewSubmitted && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Write a Review
            </h2>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setReviewRating(star)}>
                  <Star className={`w-6 h-6 ${star <= reviewRating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience with this order..."
              className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-emerald-500 resize-none"
              rows={3}
            />
            <button
              onClick={async () => {
                if (!user || reviewLoading) return;
                setReviewLoading(true);
                try {
                  await addDoc(collection(db, "reviews"), {
                    productId: "order",
                    orderId: orderId,
                    userId: user.uid,
                    rating: reviewRating,
                    comment: reviewComment,
                    createdAt: new Date().toISOString(),
                  });
                  setReviewSubmitted(true);
                  toast.success("Review submitted! Thank you for your feedback.");
                } catch {
                  toast.error("Failed to submit review");
                } finally {
                  setReviewLoading(false);
                }
              }}
              disabled={reviewLoading}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-500 text-white px-4 py-2 text-sm font-semibold hover:bg-amber-600 transition disabled:opacity-50"
            >
              {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Review
            </button>
          </div>
        )}

        {reviewSubmitted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-sm font-semibold text-emerald-800">Review submitted. Thank you for your feedback!</p>
          </div>
        )}

        {currentStatus === "Delivered" && !returnSubmitted && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-orange-500" /> Request Return
            </h2>
            <p className="text-xs text-gray-500 mb-3">Facing an issue? Request a return within 7 days of delivery.</p>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Tell us why you'd like to return this order..."
              className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-emerald-500 resize-none"
              rows={3}
            />
            <button
              onClick={async () => {
                if (!user || returnLoading || !returnReason.trim()) return;
                setReturnLoading(true);
                try {
                  const docRef = await addDoc(collection(db, "contacts"), {
                    type: "return_request",
                    name: user.displayName || user.email || "Customer",
                    email: user.email || "",
                    subject: `Return Request - Order #${orderId?.slice(0, 8)}`,
                    message: returnReason,
                    userId: user.uid,
                    orderId,
                    status: "open",
                    read: false,
                    replies: [],
                    createdAt: new Date().toISOString(),
                  });
                  await updateDoc(doc(db, "users", user.uid, "orders", orderId!), {
                    ticketContactId: docRef.id,
                  });
                  setReturnSubmitted(true);
                  toast.success("Return request submitted! We'll contact you shortly.");
                } catch {
                  toast.error("Failed to submit return request");
                } finally {
                  setReturnLoading(false);
                }
              }}
              disabled={returnLoading || !returnReason.trim()}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-orange-500 text-white px-4 py-2 text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {returnLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              Submit Return Request
            </button>
          </div>
        )}

        {returnSubmitted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-sm font-semibold text-emerald-800">Return request submitted. We'll contact you shortly.</p>
          </div>
        )}

        {currentStatus === "Delivered" && !problemSubmitted && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 mb-4">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Bug className="w-4 h-4 text-red-500" /> Report a Problem
            </h2>
            <p className="text-xs text-gray-500 mb-3">Found an issue with your order? Let us know and we'll resolve it.</p>
            <div className="space-y-3">
              <select
                value={problemType}
                onChange={(e) => setProblemType(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-red-500 bg-white"
              >
                <option value="defective">Defective / Damaged item</option>
                <option value="missing">Missing item</option>
                <option value="wrong">Wrong item received</option>
                <option value="expired">Expired / Near expiry</option>
                <option value="quality">Quality issue</option>
                <option value="delivery">Delivery issue</option>
                <option value="other">Other</option>
              </select>
              <textarea
                value={problemMessage}
                onChange={(e) => setProblemMessage(e.target.value)}
                placeholder="Describe the issue in detail..."
                className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-red-500 resize-none"
                rows={3}
              />
              <button
                onClick={async () => {
                  if (!user || problemLoading || !problemMessage.trim()) return;
                  setProblemLoading(true);
                  try {
                    const orderItems = (order.items || []).map((i: any) => i.name).join(", ");
                    const docRef = await addDoc(collection(db, "contacts"), {
                      name: user.displayName || "Customer",
                      email: user.email || "",
                      subject: `Problem: ${problemType} - Order #${orderId.slice(-8).toUpperCase()}`,
                      message: `[${problemType.toUpperCase()}] Order: ${orderId}\nItems: ${orderItems}\n\n${problemMessage}`,
                      orderId,
                      userId: user.uid,
                      createdAt: new Date(),
                      read: false,
                      status: "open",
                      replies: [],
                    });
                    await updateDoc(doc(db, "users", user.uid, "orders", orderId), {
                      ticketContactId: docRef.id,
                    });
                    setProblemSubmitted(true);
                    toast.success("Problem reported! We'll look into it shortly.");
                  } catch {
                    toast.error("Failed to report problem. Please try again.");
                  } finally {
                    setProblemLoading(false);
                  }
                }}
                disabled={problemLoading || !problemMessage.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 text-white px-4 py-2.5 text-sm font-bold hover:bg-red-600 transition disabled:opacity-50"
              >
                {problemLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bug className="w-4 h-4" />}
                Submit Problem Report
              </button>
            </div>
          </div>
        )}

        {problemSubmitted && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-sm font-semibold text-emerald-800">Problem reported! Our support team will reach out soon.</p>
          </div>
        )}

        {!ticketLoading && ticketContact && (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 mb-4">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Bug className="w-4 h-4 text-red-500" /> Ticket Status
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                ticketContact.status === "resolved" ? "bg-emerald-100 text-emerald-700" :
                ticketContact.status === "in-progress" ? "bg-amber-100 text-amber-700" :
                "bg-rose-100 text-rose-700"
              }`}>
                {(ticketContact.status || "open").charAt(0).toUpperCase() + (ticketContact.status || "open").slice(1)}
              </span>
              {ticketContact.status === "resolved" && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                </span>
              )}
              {ticketContact.status === "in-progress" && (
                <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                  <Clock className="w-3.5 h-3.5" /> Owner is reviewing
                </span>
              )}
            </div>

            <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200 mb-4">
              <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Your report</p>
              <p className="text-xs text-zinc-700">{ticketContact.message}</p>
            </div>

            {ticketContact.replies && ticketContact.replies.length > 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Conversation</p>
                {ticketContact.replies.map((r: any, idx: number) => (
                  <div key={idx} className={`flex gap-2 items-start ${r.by === "customer" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      r.by === "owner" ? "bg-emerald-100" : "bg-blue-100"
                    }`}>
                      <span className={`text-[10px] font-bold ${
                        r.by === "owner" ? "text-emerald-700" : "text-blue-700"
                      }`}>
                        {r.by === "owner" ? "S" : "Y"}
                      </span>
                    </div>
                    <div className={`flex-1 rounded-xl px-3 py-2 border max-w-[80%] ${
                      r.by === "owner"
                        ? "bg-emerald-50 border-emerald-100"
                        : "bg-blue-50 border-blue-100"
                    }`}>
                      <p className={`text-[10px] font-semibold ${
                        r.by === "owner" ? "text-emerald-700" : "text-blue-700"
                      }`}>
                        {r.by === "owner" ? "Support Team" : "You"}
                      </p>
                      <p className="text-xs text-zinc-700 mt-0.5">{r.message}</p>
                      <p className="text-[9px] text-zinc-400 mt-1">
                        {r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toLocaleString() : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {ticketContact.status !== "resolved" && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-100">
                <input
                  value={ticketReplyText}
                  onChange={(e) => setTicketReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && ticketReplyText.trim() && !ticketReplying) {
                      setTicketReplying(true);
                      try {
                        await updateDoc(doc(db, "contacts", ticketContact.id), {
                          replies: arrayUnion({
                            message: ticketReplyText.trim(),
                            createdAt: Timestamp.now(),
                            by: "customer",
                          }),
                          status: "in-progress",
                        });
                        setTicketReplyText("");
                        toast.success("Reply sent!");
                      } catch {
                        toast.error("Failed to send reply. Please try again.");
                      }
                      setTicketReplying(false);
                    }
                  }}
                />
                <button
                  onClick={async () => {
                    if (!ticketReplyText.trim() || ticketReplying) return;
                    setTicketReplying(true);
                    try {
                      await updateDoc(doc(db, "contacts", ticketContact.id), {
                        replies: arrayUnion({
                          message: ticketReplyText.trim(),
                          createdAt: Timestamp.now(),
                          by: "customer",
                        }),
                        status: "in-progress",
                      });
                      setTicketReplyText("");
                      toast.success("Reply sent!");
                    } catch {
                      toast.error("Failed to send reply. Please try again.");
                    }
                    setTicketReplying(false);
                  }}
                  disabled={!ticketReplyText.trim() || ticketReplying}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 disabled:opacity-50 transition shrink-0"
                >
                  {ticketReplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send
                </button>
              </div>
            )}

            {ticketContact.replacementOrderId && (
              <div className="mt-4 pt-4 border-t border-zinc-100">
                <a
                  href={`/orders/${ticketContact.replacementOrderId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Track Replacement Order
                </a>
              </div>
            )}

            {ticketContact.status === "resolved" && !ticketContact.replacementOrderId && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-emerald-700">Your ticket has been resolved. Thank you for your patience!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
