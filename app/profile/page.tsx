"use client";

import { toast } from "sonner";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { getAuth, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { MoreVertical, AlertTriangle, PackageX, RefreshCw, Upload, Camera, Loader2 } from "lucide-react";
import { uploadToImgBB } from "@/lib/imageUpload";

// --- Type Definitions ---
type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

type Order = {
  id: string;
  createdAt: Timestamp | { seconds: number };
  date: Timestamp | { seconds: number };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  deliveryAddress: string;
  location?: {
    lat: number;
    lng: number;
    name: string;
    phone: string;
  };
  phone?: string;
  deliveredAt?: Timestamp | { seconds: number };
};

type CustomerData = {
  name: string;
  phone: string;
  address: string;
  geolocation: string;
  photoURL?: string;
};

// Define which statuses are considered "current" vs "past"
// Using lowercase for comparison
const CURRENT_STATUSES = ["pending", "dispatched", "processing", "confirmed", "shipped"];
const PAST_STATUSES = ["delivered", "completed", "fulfilled", "cancelled"];

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    phone: "",
    address: "",
    geolocation: "",
  });
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = getAuth();
  const router = useRouter();

  // --- Fetch Customer Data Function ---
  const fetchCustomerData = async (uid: string, displayName: string | null) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCustomerData(docSnap.data() as CustomerData);
      } else {
        setCustomerData((prev) => ({
          ...prev,
          name: displayName || "",
        }));
      }
    } catch (err) {
      console.error("Error fetching customer data:", err);
    }
  };

  // --- Effect 1: Auth State Listener ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchCustomerData(currentUser.uid, currentUser.displayName);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // --- Effect 2: Order State Listener ---
  useEffect(() => {
    if (!user) return;

    setLoading(true);

    // Listen to the orders subcollection for the current user
    const ordersRef = collection(db, "users", user.uid, "orders");
    const q = query(ordersRef, orderBy("date", "desc"));

    const unsubscribeOrders = onSnapshot(q, (snapshot) => {
      const orders: Order[] = [];

      snapshot.forEach((doc) => {
        try {
          const data = doc.data();

          console.log("Order data:", data);

          // Handle date field - use createdAt or date, whichever exists
          let dateValue: Timestamp | { seconds: number };
          const dateField = data.date || data.createdAt;

          if (dateField && typeof dateField.toDate === 'function') {
            // It's a Firestore Timestamp
            dateValue = dateField;
          } else if (dateField && dateField.seconds) {
            // It's a timestamp object with seconds
            dateValue = { seconds: dateField.seconds };
          } else if (dateField instanceof Date) {
            // It's a JS Date object
            dateValue = { seconds: Math.floor(dateField.getTime() / 1000) };
          } else if (dateField) {
            // Try to parse whatever we have
            const timestamp = new Date(dateField).getTime();
            dateValue = { seconds: Math.floor(timestamp / 1000) };
          } else {
            // Fallback to current time
            dateValue = { seconds: Math.floor(Date.now() / 1000) };
          }

          // Create order object
          const order: Order = {
            id: doc.id,
            createdAt: dateValue,
            date: dateValue,
            items: data.items || [],
            totalAmount: data.totalAmount || 0,
            status: data.status || "pending",
            deliveryAddress: data.deliveryAddress || data.location?.name || "",
            location: data.location,
            phone: data.phone || data.location?.phone || "",
          };

          orders.push(order);
        } catch (error) {
          console.error(`Error processing order ${doc.id}:`, error);
        }
      });

      // Debug: Log all orders and their statuses
      console.log("All orders:", orders.map(o => ({
        id: o.id,
        status: o.status,
        statusLower: o.status.toLowerCase()
      })));

      // Filter orders based on status (case-insensitive comparison)
      const current = orders.filter((order) => {
        const statusLower = order.status.toLowerCase();
        return CURRENT_STATUSES.includes(statusLower);
      });

      const past = orders.filter((order) => {
        const statusLower = order.status.toLowerCase();
        return PAST_STATUSES.includes(statusLower);
      });

      // Debug: Log filtered results
      console.log("Current orders count:", current.length);
      console.log("Past orders count:", past.length);
      console.log("Current statuses:", CURRENT_STATUSES);
      console.log("Past statuses:", PAST_STATUSES);

      setCurrentOrders(current);
      setPastOrders(past);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribeOrders();
  }, [user]);

  // --- Handlers ---
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, customerData, { merge: true });
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    }
  };

  const handleReorder = async (order: Order) => {
    if (!user) return;
    try {
      const ordersRef = collection(db, "users", user.uid, "orders");
      await addDoc(ordersRef, {
        items: order.items,
        totalAmount: order.totalAmount,
        status: "pending",
        date: Timestamp.now(),
        createdAt: Timestamp.now(),
        deliveryAddress: customerData.address || "",
        phone: customerData.phone || "",
      });
      toast.success("Order placed again!");
    } catch (err) {
      console.error("Error reordering:", err);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadToImgBB(file);
      await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });
      setCustomerData((prev) => ({ ...prev, photoURL: url }));
      toast.success("Profile photo updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    }
    setUploadingPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canShowMenu = (order: Order) => {
    const delivered = order.status.toLowerCase() === "delivered" || order.status.toLowerCase() === "completed";
    if (!delivered) return false;
    if (!order.deliveredAt) return true; // No deliveredAt, show anyway
    const seconds = (order.deliveredAt as any).seconds || (order.deliveredAt as any)._seconds;
    if (!seconds) return true;
    const deliveredDate = new Date(seconds * 1000);
    const hoursSince = (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60);
    return hoursSince >= 24;
  };

  const handleRaiseQuery = async (order: Order, problemType: string) => {
    if (!user) return;
    try {
      const orderItems = (order.items || []).map((i) => i.name).join(", ");
      const docRef = await addDoc(collection(db, "contacts"), {
        name: customerData.name || user.displayName || "Customer",
        email: user.email || "",
        subject: `Problem: ${problemType} - Order #${order.id.slice(-8).toUpperCase()}`,
        message: `[${problemType.toUpperCase()}] Order: ${order.id}\nItems: ${orderItems}`,
        orderId: order.id,
        userId: user.uid,
        createdAt: new Date(),
        read: false,
        status: "open",
        replies: [],
      });
      // Store ticketContactId in order doc
      await setDoc(doc(db, "users", user.uid, "orders", order.id), { ticketContactId: docRef.id }, { merge: true });
      toast.success("Query submitted! Check your order page for updates.");
    } catch (err) {
      console.error("Error raising query:", err);
      toast.error("Failed to submit query.");
    }
    setOpenMenuIndex(null);
  };

  // Close menu when clicking outside

  // Close menu when clicking outside
  useEffect(() => {
    if (openMenuIndex === null) return;
    const handler = () => setOpenMenuIndex(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openMenuIndex]);

  // Get status display color
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (CURRENT_STATUSES.includes(statusLower)) {
      if (statusLower === "pending") return "bg-yellow-500";
      if (statusLower === "dispatched") return "bg-blue-500";
      if (statusLower === "processing") return "bg-orange-500";
      return "bg-blue-500";
    }
    if (PAST_STATUSES.includes(statusLower)) {
      if (statusLower === "cancelled") return "bg-red-500";
      return "bg-green-500";
    }
    return "bg-gray-500";
  };

  // Get status display text
  const getStatusText = (status: string) => {
    return status.toUpperCase();
  };

  // Get address from order
  const getOrderAddress = (order: Order) => {
    if (order.deliveryAddress) return order.deliveryAddress;
    if (order.location?.name) return order.location.name;
    return "Address not specified";
  };

  // Get phone from order
  const getOrderPhone = (order: Order) => {
    if (order.phone) return order.phone;
    if (order.location?.phone) return order.location.phone;
    return "Phone not specified";
  };

  // Get date from order
  const getOrderDate = (order: Order) => {
    try {
      const timestamp = order.date || order.createdAt;
      if (timestamp && typeof timestamp === 'object') {
        const seconds = (timestamp as any).seconds ||
                       (timestamp as any)._seconds ||
                       (timestamp as any)?.toDate?.()?.getTime() / 1000;
        if (seconds) {
          return new Date(seconds * 1000).toLocaleString();
        }
      }
      return "Date not available";
    } catch (error) {
      return "Date not available";
    }
  };

  // --- Render ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
          </div>
          <p className="text-zinc-600 font-semibold">Please login to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50">
    <div className="p-4 sm:p-8 pt-8 sm:pt-24 max-w-7xl mx-auto space-y-6 lg:space-y-0 lg:flex lg:gap-8">
      {/* Left: Profile Edit */}
      <div className="w-full lg:w-1/3 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 flex flex-col items-center border border-emerald-100/50">
        <div className="relative mb-4">
          <Image
            src={customerData.photoURL || user.photoURL || "/fallback-image.png"}
            width={120}
            height={120}
            alt="Profile"
            className="rounded-full ring-4 ring-emerald-200 shadow-lg object-cover w-[120px] h-[120px]"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute -bottom-1 -right-1 w-9 h-9 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md transition disabled:opacity-50 border-2 border-white"
          >
            {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />
        </div>

        {/* Full Name Input */}
        <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-2">{customerData.name}</h1>
        <div className="w-full mb-2">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Full Name</label>
          <input
            type="text"
            value={customerData.name || ""}
            onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-zinc-200 bg-zinc-50 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
            placeholder="Your Full Name"
          />
        </div>

        {/* Email, Phone, Address Inputs */}
        <div className="w-full mb-2">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Email</label>
          <input
            type="email"
            value={user.email || ""}
            disabled
            className="w-full px-3.5 py-2.5 border border-zinc-200 bg-zinc-100 text-sm font-semibold rounded-xl cursor-not-allowed text-zinc-500"
          />
        </div>
        <div className="w-full mb-2">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Phone</label>
          <input
            type="text"
            value={customerData.phone || ""}
            onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-zinc-200 bg-zinc-50 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
            placeholder="Phone number"
          />
        </div>
        <div className="w-full mb-4">
          <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Address</label>
          <textarea
            value={customerData.address || ""}
            onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-zinc-200 bg-zinc-50 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all resize-none"
            placeholder="Delivery address"
            rows={3}
          />
        </div>
        <div className="flex gap-3 mt-4 w-full">
          <button
            onClick={handleSaveProfile}
            className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
          >
            Save Profile
          </button>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 border-2 border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 hover:border-red-300 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Right: Orders - Make it w-full on mobile, then w-2/3 on large screens */}
      <div className="w-full lg:w-2/3">
        {/* ... Rest of the Orders section code ... */}
        {/* Current Orders */}
        <h2 className="text-xl font-black text-zinc-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></span>
          Current Orders
        </h2>

        {loading ? (
          <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 text-center"><p className="text-zinc-400 font-medium text-sm">Loading orders...</p></div>
        ) : currentOrders.length === 0 ? (
          <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 text-center"><p className="text-zinc-400 font-medium text-sm">No current orders.</p></div>
        ) : (
          <div className="space-y-4">
            {currentOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-sm rounded-2xl p-4 border border-emerald-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2 border-b pb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">
                      Order ID: {order.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      Date: {getOrderDate(order)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${getStatusColor(
                      order.status
                    )} flex-shrink-0 ml-2`}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>

                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Total:</span> ₹{order.totalAmount}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  <span className="font-medium">Deliver to:</span> {getOrderAddress(order)}
                </p>
                <div className="mt-2 text-xs">
                  <span className="font-medium">Items:</span>{" "}
                  {order.items.map((item) => item.name).join(", ")}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past Orders */}
        <h2 className="text-xl font-black text-zinc-900 mt-8 mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-gradient-to-b from-zinc-400 to-zinc-300 rounded-full"></span>
          Past Orders
        </h2>

        {loading ? (
          <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 text-center"><p className="text-zinc-400 font-medium text-sm">Loading orders...</p></div>
        ) : pastOrders.length === 0 ? (
          <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 text-center"><p className="text-zinc-400 font-medium text-sm">No past orders.</p></div>
        ) : (
          <div className="space-y-4">
            {pastOrders.map((order, idx) => (
              <div
                key={order.id}
                className="bg-white shadow-sm rounded-2xl p-4 border border-zinc-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2 border-b pb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700 truncate">
                      Order ID: {order.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      Date: {getOrderDate(order)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${getStatusColor(
                        order.status
                      )} flex-shrink-0`}
                    >
                      {getStatusText(order.status)}
                    </span>
                    {/* Three-dots menu for delivered/completed orders (24h+ after delivery) */}
                    {canShowMenu(order) && (
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenuIndex(openMenuIndex === idx ? null : idx); }}
                          className="p-1 hover:bg-zinc-100 rounded-lg transition"
                        >
                          <MoreVertical className="w-4 h-4 text-zinc-400" />
                        </button>
                        {openMenuIndex === idx && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 w-52 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                            <p className="px-3 py-2 text-[9px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">Raise a Query</p>
                            <button onClick={() => handleRaiseQuery(order, "defective")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 hover:bg-rose-50 hover:text-rose-700 transition text-left">
                              <AlertTriangle className="w-3.5 h-3.5" /> Defective / Damaged Item
                            </button>
                            <button onClick={() => handleRaiseQuery(order, "missing")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 hover:bg-amber-50 hover:text-amber-700 transition text-left">
                              <PackageX className="w-3.5 h-3.5" /> Missing Item
                            </button>
                            <button onClick={() => handleRaiseQuery(order, "wrong")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 hover:bg-blue-50 hover:text-blue-700 transition text-left">
                              <RefreshCw className="w-3.5 h-3.5" /> Wrong Order
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Total:</span> ₹{order.totalAmount}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  <span className="font-medium">Deliver to:</span> {getOrderAddress(order)}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-xs text-gray-600 flex-1 truncate">
                    <span className="font-medium">Items:</span>{" "}
                    {order.items.map((item) => item.name).join(", ")}
                  </p>
                  <button
                    onClick={() => handleReorder(order)}
                    className="px-4 py-1.5 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 transition-all flex-shrink-0 ml-2 shadow-sm"
                  >
                    Reorder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}