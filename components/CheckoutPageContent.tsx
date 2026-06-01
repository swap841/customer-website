"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { getAuth } from "firebase/auth";
import { getAreaCode } from "../utils/getAreaCode";
import { getDistanceKm } from "@/utils/distance";
import { doc, setDoc, collection, writeBatch, increment } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { validateCoupon } from "../utils/coupon";
import TimeSlotPicker, { type TimeSlot } from "./TimeSlotPicker";
import { toast } from "sonner";
import {
  MapPin,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Phone,
  Mail,
  User,
  Clock,
} from "lucide-react";

import { useContactInfo } from "@/hooks/useContactInfo";
import { useAddresses } from "@/hooks/useAddresses";
import AddressHistory from "@/components/AddressHistory";

const STORE_LAT_DEFAULT = 17.6868;
const STORE_LNG_DEFAULT = 74.0066;

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: () => void) => void;
}

const EXPRESS_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://grocery-server-10ct.onrender.com';

export default function CheckoutPageContent() {
  const router = useRouter();
  const auth = getAuth();
  const { contactInfo } = useContactInfo();

  const MAX_DIRECT_DELIVERY_KM = contactInfo.deliveryRadiusKm || 20;
  const TAX_PERCENT = contactInfo.taxPercentage || 5;
  const DELIVERY_FEE_PER_KM = contactInfo.deliveryFeePerKm || 5;
  const FREE_DELIVERY_ABOVE = contactInfo.freeDeliveryAbove || 100;
  const THIRD_PARTY_DELIVERY_CHARGE = 25;
  const STORE_LAT = contactInfo.warehouseLat || STORE_LAT_DEFAULT;
  const STORE_LNG = contactInfo.warehouseLng || STORE_LNG_DEFAULT;

  const {
    cartItems,
    subtotal,
    deliveryCharge,
    grandTotal,
    clearCart,
  } = useCart();

  const [user, setUser] = useState<{ uid: string; displayName: string | null; phoneNumber: string | null; email: string | null } | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [areaCode, setAreaCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<"delivery" | "pickup">("delivery");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [isThirdPartyDelivery, setIsThirdPartyDelivery] = useState(false);
  const [preferredSlot, setPreferredSlot] = useState<TimeSlot>("morning");
  const { savedAddresses, saveAddress } = useAddresses();

  const savedAddressStrings = savedAddresses.map((a) => a.address);

  const effectiveDeliveryFee = deliveryOption === "delivery" ? (subtotal >= FREE_DELIVERY_ABOVE ? 0 : deliveryCharge) : 0;
  const taxAmount = Math.round((subtotal * TAX_PERCENT) / 100);
  const totalSavings = effectiveDeliveryFee === 0 && deliveryOption === "delivery" ? Math.round(contactInfo.deliveryFeePerKm || 5) * 5 : 0;

  const thirdPartyCharge = isThirdPartyDelivery && deliveryOption === "delivery" ? THIRD_PARTY_DELIVERY_CHARGE : 0;
  const baseTotal = deliveryOption === "delivery"
    ? subtotal + deliveryCharge + taxAmount + thirdPartyCharge
    : subtotal + taxAmount;
  const finalTotal = Math.max(baseTotal - couponDiscount, 0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (!u) {
        router.push("/auth");
      } else {
        setUser(u);
        setName(u.displayName || "");
        setPhone(u.phoneNumber || "");
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  useEffect(() => {
    if (!isLoading) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [isLoading]);

  const checkDistance = useCallback((lat: number, lng: number) => {
    const dist = getDistanceKm(STORE_LAT, STORE_LNG, lat, lng);
    setDistanceKm(Math.round(dist * 10) / 10);
    if (dist > MAX_DIRECT_DELIVERY_KM) {
      setIsThirdPartyDelivery(true);
      toast(`You are ${dist.toFixed(1)} km away. Additional delivery charge of ₹${THIRD_PARTY_DELIVERY_CHARGE} will apply.`);
    } else {
      setIsThirdPartyDelivery(false);
    }
  }, []);

  useEffect(() => {
    if (deliveryOption === "delivery") {
      if (!navigator.geolocation) {
        console.warn("Geolocation not supported");
        return;
      }
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          setAreaCode(getAreaCode(coords.lat, coords.lng));
          checkDistance(coords.lat, coords.lng);
          setIsLoading(false);
        },
        () => setIsLoading(false),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [deliveryOption, checkDistance]);

  const saveUserProfile = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        name, phone, address,
        geolocation: location ? `${location.lat.toFixed(6)},${location.lng.toFixed(6)}` : "",
        email: user.email,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const applyCouponCode = async () => {
    const code = couponCode.trim();
    if (!code) { setCouponMessage("Enter a coupon code to apply"); return; }
    if (couponLoading) return;
    setCouponLoading(true);
    setCouponMessage(null);
    try {
      const result = await validateCoupon(code, baseTotal);
      if (!result.valid) {
        setCouponDiscount(0);
        setCouponMessage(result.error || "Coupon could not be applied");
      } else {
        setCouponDiscount(result.discount || 0);
        setCouponMessage(`Coupon applied! Discount ₹${result.discount?.toFixed(0)}`);
      }
    } catch {
      setCouponDiscount(0);
      setCouponMessage("Failed to validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const saveOrderToFirestore = async (orderData: Record<string, unknown>) => {
    if (!user) return null;
    try {
      const ordersRef = doc(collection(db, "users", user.uid, "orders"));
      await setDoc(ordersRef, {
        ...orderData,
        id: ordersRef.id,
        date: new Date().toISOString(),
        timestamp: Date.now(),
      });
      return ordersRef.id;
    } catch (error) {
      console.error("Error saving order:", error);
      return null;
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (orderData: Record<string, unknown>): Promise<void> => {
    const toastId = toast.loading("Initializing payment...");

    try {
      if (!user) {
        toast.dismiss(toastId);
        toast.error("Please login to continue.");
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(`${EXPRESS_URL}/api/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalTotal, receipt: `receipt_${Date.now()}` }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.dismiss(toastId);
        toast.error(data.error || "Failed to create payment order");
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.dismiss(toastId);
        toast.error("Failed to load payment gateway.");
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }

      toast.dismiss(toastId);
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        toast.error("Payment gateway not configured.");
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }

      const options: RazorpayOptions = {
        key: razorpayKeyId,
        amount: Math.round(finalTotal * 100),
        currency: "INR",
        name: "My Store Grocery Logistics",
        description: `Order of ${cartItems.length} item(s)`,
        order_id: data.orderId,
        handler: async (response: RazorpayResponse) => {
          const paymentToastId = toast.loading("Verifying payment...");
          try {
            const verifyRes = await fetch(`${EXPRESS_URL}/api/razorpay/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: user?.uid,
                orderData,
                couponCode: couponDiscount > 0 ? couponCode : null,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              toast.dismiss(paymentToastId);
              toast.error("Payment verification failed.");
              setIsSubmitting(false);
              setIsLoading(false);
              return;
            }

            if (verifyData.orderId) {
              if (address && deliveryOption === "delivery") {
                saveAddress(address, location?.lat, location?.lng);
              }
              toast.dismiss(paymentToastId);
              toast.success("Payment successful! Order placed.");
              if (clearCart) clearCart();
              router.push(`/order-success?orderId=${verifyData.orderId}`);
            } else {
              toast.dismiss(paymentToastId);
              toast.error("Payment received but order saving failed.");
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            toast.dismiss(paymentToastId);
            toast.error("An error occurred after payment.");
            setIsLoading(false);
            setIsSubmitting(false);
          }
        },
        prefill: { name, email: user?.email || "", contact: phone },
        theme: { color: "#10b981" },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled.");
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
            setIsLoading(false);
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed.");
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        setIsLoading(false);
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      toast.dismiss(toastId);
      toast.error("Payment initialization failed.");
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const placeOrder = async () => {
    if (isSubmitting) return;
    if (!name) { toast.error("Please enter your name"); return; }
    if (!phone) { toast.error("Please enter your phone number"); return; }
    if (deliveryOption === "delivery") {
      if (!address) { toast.error("Please enter delivery address"); return; }
    } else {
      setLocation({ lat: 0, lng: 0 });
      setAreaCode("PICKUP");
    }
    if (!user) { toast.error("Please login to place an order"); return; }
    if (cartItems.length === 0) { toast.error("Your cart is empty"); return; }

    setIsSubmitting(true);
    setIsLoading(true);

    try {
      await saveUserProfile();

      const orderItems = cartItems.map((item) => {
        let weightGrams = 0;
        if (item.weight !== undefined) {
          const weightStr = String(item.weight).trim();
          const parsed = parseFloat(weightStr);
          if (!isNaN(parsed)) {
            weightGrams = weightStr.toLowerCase().includes("kg") ? parsed * 1000 : parsed;
          }
        }
        return {
          productId: item.id || item.name,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          weight: weightGrams,
          imageUrl: item.imageUrl || "",
        };
      });

      const totalWeight = orderItems.reduce((sum, item) => sum + item.weight * item.quantity, 0);
      const now = new Date().toISOString();
      const outOfCity = deliveryOption === "delivery" && distanceKm !== null && distanceKm > MAX_DIRECT_DELIVERY_KM;

      const nowDate = new Date();
      const preparationHours = 2;
      let deliveryHours = 1;
      if (outOfCity) {
        deliveryHours = (distanceKm || 20) / 40;
      }
      const estimatedDeliveryDate = new Date(nowDate.getTime() + (preparationHours + deliveryHours) * 60 * 60 * 1000);

      const orderData: Record<string, unknown> = {
        userId: user.uid,
        userName: name || user.displayName || "",
        userPhone: phone || "",
        userEmail: user.email || "",
        items: orderItems,
        address: {
          name, phone,
          addressLine: deliveryOption === "delivery" ? address : "Store Pickup",
          pincode: deliveryOption === "delivery" ? areaCode : "000000",
          city: deliveryOption === "delivery" ? "" : "Store Pickup",
          lat: location?.lat || null, lng: location?.lng || null,
        },
        status: "Pending",
        subtotal,
        deliveryCharge,
        taxAmount,
        couponDiscount,
        totalAmount: finalTotal,
        totalWeight,
        payment: { method: "cod", status: "pending" },
        areaCode: deliveryOption === "delivery" ? areaCode : "PICKUP",
        outOfCity,
        estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
        createdAt: now,
        rejectionHistory: [],
        couponApplied: couponDiscount > 0 ? couponCode : null,
        deliveryTimeSlot: preferredSlot,
      };

      if (paymentMethod === "Online") {
        await handleRazorpayPayment(orderData);
      } else {
        // COD - client-side batch write to orders + users/{uid}/orders collections
        const batch = writeBatch(db);
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const orderDataWithMeta = {
          ...orderData,
          id: orderId,
          userId: user.uid,
          status: "Pending",
          payment: { method: "cod", status: "pending" },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        batch.set(doc(db, "orders", orderId), orderDataWithMeta);
        batch.set(doc(db, "users", user.uid, "orders", orderId), orderDataWithMeta);

        if (orderData.items && Array.isArray(orderData.items)) {
          for (const item of orderData.items) {
            if (item.productId) {
              batch.update(doc(db, "products", item.productId), { stock: increment(-(item.quantity || 1)) });
            }
          }
        }

        if (couponDiscount > 0 && couponCode) {
          batch.update(doc(db, "coupons", couponCode.toUpperCase()), { usedCount: increment(1) });
        }

        try {
          await batch.commit();
          if (address && deliveryOption === "delivery") saveAddress(address, location?.lat, location?.lng);
          toast.success("Order placed successfully!");
          if (clearCart) clearCart();
          router.push(`/order-success?orderId=${orderId}`);
        } catch (error) {
          console.error("Order failed:", error);
          toast.error("Failed to place order. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("An error occurred while placing your order.");
    } finally {
      setIsSubmitting(false);
      if (paymentMethod === "COD") setIsLoading(false);
    }
  };

  const getDeliveryLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        setAreaCode(getAreaCode(coords.lat, coords.lng));
        checkDistance(coords.lat, coords.lng);
        setIsLoading(false);
        toast.success("Delivery location updated successfully!");
      },
      () => {
        setIsLoading(false);
        toast.error("Failed to get location. Please enable location permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-32">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-2 rounded-xl"><ShieldCheck className="w-6 h-6 text-emerald-600" /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-500">Secure & encrypted payment</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
        <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2"><Truck className="w-5 h-5 text-emerald-600" /> Order Type</h2>
        <div className="grid grid-cols-2 gap-4">
          {(["delivery", "pickup"] as const).map((opt) => (
            <div key={opt}
              className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                deliveryOption === opt
                  ? `${opt === "delivery" ? "border-emerald-500 bg-emerald-50" : "border-blue-500 bg-blue-50"} shadow-md`
                  : "border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setDeliveryOption(opt)}
            >
              <div className="flex items-center">
                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                  deliveryOption === opt ? `${opt === "delivery" ? "border-emerald-500 bg-emerald-500" : "border-blue-500 bg-blue-500"}` : "border-gray-400"
                }`}>
                  {deliveryOption === opt && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-1">
                    {opt === "delivery" ? <><Truck className="w-4 h-4" /> Home Delivery</> : <><Store className="w-4 h-4" /> Store Pickup</>}
                  </h3>
                  <p className="text-sm text-gray-600">{opt === "delivery" ? "Get it delivered to your address" : "Pick up from our store"}</p>
                  <p className="text-sm font-medium mt-1">{opt === "delivery" ? `Delivery: ₹${deliveryCharge}` : "Free pickup"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isThirdPartyDelivery && deliveryOption === "delivery" && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800">Extended Delivery</h3>
            <p className="text-amber-700 text-sm mt-1">
              You are {distanceKm} km away. Additional delivery charge of <span className="font-bold">₹{THIRD_PARTY_DELIVERY_CHARGE}</span> will apply.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
        <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2"><User className="w-5 h-5 text-emerald-600" /> Customer Information</h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-300 p-3 bg-gray-50 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <label className="block text-sm font-medium text-gray-700 mb-1"><User className="w-3.5 h-3.5 inline mr-1" /> Full Name *</label>
            <input className="w-full bg-transparent outline-none text-gray-800" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="rounded-xl border border-gray-300 p-3 bg-gray-50 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <label className="block text-sm font-medium text-gray-700 mb-1"><Phone className="w-3.5 h-3.5 inline mr-1" /> Phone Number *</label>
            <input className="w-full bg-transparent outline-none text-gray-800" placeholder="Enter your phone number" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" required />
          </div>
          {deliveryOption === "delivery" && (
            <>
              <div className="rounded-xl border border-gray-300 p-3 bg-gray-50 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
                <label className="block text-sm font-medium text-gray-700 mb-1"><MapPin className="w-3.5 h-3.5 inline mr-1" /> Delivery Address *</label>
                <textarea className="w-full bg-transparent outline-none text-gray-800 resize-none" placeholder="Enter complete delivery address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} required />
              </div>
              <AddressHistory
                onSelect={(addr) => setAddress(addr)}
                savedAddresses={savedAddressStrings}
              />
              <div className="rounded-xl border border-gray-300 p-3 bg-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700"><Navigation className="w-3.5 h-3.5 inline mr-1" /> Delivery Location</label>
                  <button type="button" onClick={getDeliveryLocation} disabled={isLoading}
                    className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1">
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                    {isLoading ? "Getting..." : "Get Location"}
                  </button>
                </div>
                {isLoading ? (
                  <div className="flex items-center space-x-2"><Loader2 className="w-4 h-4 animate-spin text-gray-600" /><span className="text-gray-600">Detecting location...</span></div>
                ) : location ? (
                  <div className="text-gray-800">
                    <p className="text-sm flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Delivery location detected
                      {distanceKm !== null && <span className="text-xs text-gray-500 ml-1">({distanceKm} km from store)</span>}
                    </p>
                  </div>
                ) : (
                  <div><p className="text-gray-500 text-sm">Location not detected yet</p></div>
                )}
              </div>
            </>
          )}
          {deliveryOption === "pickup" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-lg mr-3"><Store className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <h3 className="font-semibold text-blue-800">Store Pickup Information</h3>
                  <p className="text-blue-700 text-sm mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {contactInfo.address || "Store address not set"}</p>
                  <p className="text-blue-600 text-sm mt-2 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pickup Hours: 9:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
        <h2 className="font-bold text-lg mb-4 text-gray-800">Bill Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2"><span className="text-gray-600">Items total ({cartItems.length} items)</span><span className="font-medium">₹{subtotal}</span></div>
          {deliveryOption === "delivery" && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Delivery</span>
              <span className="font-medium">{effectiveDeliveryFee === 0 ? <span className="text-blue-600 font-semibold">FREE</span> : `₹${effectiveDeliveryFee}`}</span>
            </div>
          )}
          <div className="flex justify-between py-2"><span className="text-gray-600">Tax</span><span className="font-medium">₹{taxAmount}</span></div>
          {isThirdPartyDelivery && deliveryOption === "delivery" && (
            <div className="flex justify-between py-2 text-amber-700"><span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Extended distance fee</span><span className="font-medium">₹{THIRD_PARTY_DELIVERY_CHARGE}</span></div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between py-2 text-emerald-600 font-semibold"><span>Coupon discount</span><span>-₹{couponDiscount}</span></div>
          )}
          <div className="border-t pt-3 mt-2">
            <div className="flex justify-between font-bold text-lg"><span>Grand Total</span><span className="text-emerald-600">₹{finalTotal}</span></div>
          </div>
          {deliveryOption === "delivery" && totalSavings > 0 && (
            <div className="bg-emerald-50 rounded-xl p-3 mt-3">
              <p className="text-emerald-700 text-sm flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> You saved ₹{totalSavings} on delivery!</p>
            </div>
          )}
        </div>
      </div>

      {deliveryOption === "delivery" && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2"><Clock className="w-5 h-5 text-emerald-600" /> Delivery Time Slot</h2>
          <TimeSlotPicker selectedSlot={preferredSlot} onSelectSlot={setPreferredSlot} />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
        <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-600" /> Payment Method</h2>
        <div className="space-y-3">
          {(["COD", "Online"] as const).map((method) => (
            <div key={method}
              className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${paymentMethod === method ? "border-emerald-500 bg-emerald-50 shadow-md" : "border-gray-300 hover:bg-gray-50"}`}
              onClick={() => setPaymentMethod(method)}
            >
              <label className="flex items-center cursor-pointer">
                <input type="radio" className="h-5 w-5 text-emerald-600 accent-emerald-600" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                <div className="ml-3">
                  <span className="text-gray-800 font-medium flex items-center gap-2">
                    {method === "COD" ? <><Banknote className="w-5 h-5 text-emerald-600" /> Cash on Delivery</> : <><CreditCard className="w-5 h-5 text-emerald-600" /> Pay Online (Razorpay)</>}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{method === "COD" ? "Pay when you receive your order" : "UPI, Cards, Netbanking"}</p>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
        <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2"><Clock className="w-5 h-5 text-emerald-600" /> Promo Code</h2>
        <div className="flex flex-col gap-3 md:flex-row">
          <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon code"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none" />
          <button type="button" onClick={applyCouponCode} disabled={couponLoading}
            className="rounded-xl bg-emerald-600 text-white px-4 py-3 font-semibold shadow-sm hover:bg-emerald-700 disabled:opacity-50">
            {couponLoading ? "Applying..." : "Apply"}
          </button>
        </div>
        {couponMessage && <p className="mt-3 text-sm text-gray-700">{couponMessage}</p>}
        {couponDiscount > 0 && <p className="mt-2 text-sm text-emerald-700">Discount applied: ₹{couponDiscount.toFixed(0)}</p>}
      </div>

      <button onClick={placeOrder} disabled={isLoading || isSubmitting}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {isLoading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> {paymentMethod === "Online" ? "Opening Payment Gateway..." : "Placing Order..."}</>
        ) : (
          <>{paymentMethod === "Online" ? `Pay ₹${finalTotal} with Razorpay` : `Place Order - ₹${finalTotal}`}</>
        )}
      </button>
    </div>
  );
}
