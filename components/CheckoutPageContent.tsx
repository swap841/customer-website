"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { getAuth } from "firebase/auth";
import { getAreaCode, getAreaCodeFromAddress } from "../utils/getAreaCode";
import { getDistanceKm } from "@/utils/distance";
import { pincodeToCoords } from "@/lib/pincodeToCoords";
import { doc, setDoc, writeBatch, increment, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { validateCoupon } from "../utils/coupon";

import LocationPicker from "./LocationPicker";
import AddressVerification from "./AddressVerification";
import DeliveryRadiusWarning from "./DeliveryRadiusWarning";
import PermissionGate from "./PermissionGate";
import { toast } from "sonner";
import type { DeliveryZoneInfo } from "@/lib/locationUtils";
import {
  MapPin,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Phone,
  User,
  Clock,
} from "lucide-react";
import { calculateDeliveryTime, calculateDistance } from "@/lib/deliveryTimeUtils";

import { useContactInfo } from "@/hooks/useContactInfo";
import { useAddress } from "@/hooks/useAddress";
import SavedAddress from "@/components/SavedAddress";
import { getAppConfig } from "@/lib/appConfig";

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

  const EXPRESS_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://grocery-server-u2qq.onrender.com';

  let razorpayScriptLoaded = false;
  let razorpayScriptFailed = false;

export default function CheckoutPageContent() {
  const router = useRouter();
  const auth = getAuth();
  const { contactInfo } = useContactInfo();
  const symbol = contactInfo.currencySymbol || "\u20B9";

  const MAX_DIRECT_DELIVERY_KM = contactInfo.deliveryRadiusKm || 20;
  const TAX_PERCENT = contactInfo.taxPercentage || 5;
  const DELIVERY_FEE_PER_KM = contactInfo.deliveryFeePerKm || 5;
  const FREE_DELIVERY_ABOVE = contactInfo.freeDeliveryAbove || 100;
  const THIRD_PARTY_DELIVERY_CHARGE = contactInfo.thirdPartyDeliveryCharge || 25;
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
  const [geoHash, setGeoHash] = useState("");
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

  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [appCfg, setAppCfg] = useState<any>(null);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZoneInfo | null>(null);
  const [pincodeValidated, setPincodeValidated] = useState(false);
  const { savedAddress, saveAddress, clearAddress } = useAddress();

  const effectiveDeliveryFee = deliveryOption === "delivery" ? (subtotal >= FREE_DELIVERY_ABOVE ? 0 : deliveryCharge) : 0;
  const taxAmount = Math.round((subtotal * TAX_PERCENT) / 100);
  const totalSavings = effectiveDeliveryFee === 0 && deliveryOption === "delivery" ? Math.round(contactInfo.deliveryFeePerKm || 5) * 5 : 0;

  const thirdPartyCharge = isThirdPartyDelivery && deliveryOption === "delivery" ? THIRD_PARTY_DELIVERY_CHARGE : 0;
  const baseTotal = deliveryOption === "delivery"
    ? subtotal + effectiveDeliveryFee + taxAmount + thirdPartyCharge
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
    getAppConfig(true).then(cfg => {
      setPaymentConfig(cfg.payment || {});
      setAppCfg(cfg);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoading) {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [isLoading]);

  useEffect(() => {
    if (couponDiscount > 0) {
      setCouponDiscount(0);
      setCouponCode("");
      setCouponMessage(null);
    }
  }, [deliveryOption, cartItems]);

  const checkDistance = useCallback((lat: number, lng: number) => {
    const dist = getDistanceKm(STORE_LAT, STORE_LNG, lat, lng);
    setDistanceKm(Math.round(dist * 10) / 10);
    if (dist > MAX_DIRECT_DELIVERY_KM) {
      setIsThirdPartyDelivery(true);
      toast(`You are ${dist.toFixed(1)} km away. Additional delivery charge of ${symbol}${THIRD_PARTY_DELIVERY_CHARGE} will apply.`);
    } else {
      setIsThirdPartyDelivery(false);
    }
  }, [MAX_DIRECT_DELIVERY_KM, THIRD_PARTY_DELIVERY_CHARGE, STORE_LAT, STORE_LNG, symbol]);

  const handleLocationSelected = useCallback((data: {
    lat: number;
    lng: number;
    geoHash: string;
    zone: DeliveryZoneInfo;
  }) => {
    setLocation({ lat: data.lat, lng: data.lng });
    setGeoHash(data.geoHash);
    setAreaCode(getAreaCode(data.lat, data.lng));
    setDistanceKm(data.zone.distanceKm);
    setIsThirdPartyDelivery(data.zone.deliveryType === "thirdParty");
    setDeliveryZone(data.zone);
  }, []);

  const handlePincodeValidated = useCallback((validation: { valid: boolean; error?: string }) => {
    setPincodeValidated(validation.valid);
    if (validation.valid && !location) {
      const pincode = address.match(/\b\d{6}\b/)?.[0];
      if (pincode) {
        const coords = pincodeToCoords(pincode);
        setLocation({ lat: coords.lat, lng: coords.lng });
      }
    }
  }, [address, location]);

  const saveUserProfile = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        name, phone,
        shippingAddress: deliveryOption === "delivery" ? {
          address,
          pincode: address.match(/\b\d{6}\b/)?.[0] || "",
          lat: location?.lat || null,
          lng: location?.lng || null,
          geoHash: geoHash || "",
          label: "Home",
        } : null,
        geolocation: location ? `${location.lat.toFixed(6)},${location.lng.toFixed(6)}` : "",
        email: user.email,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {}
  };

  const applyCouponCode = async () => {
    const code = couponCode.trim();
    if (!code) { setCouponMessage("Enter a coupon code to apply"); return; }
    setCouponLoading(true);
    setCouponMessage(null);
    try {
      const result = await validateCoupon(code, subtotal);
      if (result.valid && result.discount) {
        setCouponDiscount(result.discount);
        setCouponMessage(`Coupon applied! You saved ${symbol}${result.discount}`);
      } else {
        setCouponDiscount(0);
        setCouponMessage(result.error || "Invalid or expired coupon");
      }
    } catch { setCouponMessage("Error validating coupon"); }
    finally { setCouponLoading(false); }
  };

  const handleRazorpayPayment = async (orderData: Record<string, unknown>) => {
    const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-u2qq.onrender.com";
    const rzpKeyId = paymentConfig?.razorpayKeyId || "";
    if (!rzpKeyId) {
      toast.error("Online payment not configured. Please use Cash on Delivery.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Initiating payment...");

    try {
      let resp, data;
      try {
        const orderRes = await fetch(`${SERVER_URL}/api/create-razorpay-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalTotal,
            currency: "INR",
            userId: user!.uid,
            receipt: `receipt_${Date.now()}`,
          }),
        });
        if (!orderRes.ok) throw new Error("Failed to create order");
        resp = orderRes;
        data = await resp.json();
      } catch {
        toast.dismiss(toastId);
        toast.error("Payment server unavailable. Please use Cash on Delivery.");
        setIsSubmitting(false);
        return;
      }

      if (!data || !data.id) {
        toast.dismiss(toastId);
        toast.error("Payment initialization failed. Please use Cash on Delivery.");
        setIsSubmitting(false);
        return;
      }

      if (razorpayScriptFailed) {
        toast.dismiss(toastId);
        toast.error("Payment system unavailable. Please use Cash on Delivery.");
        setIsSubmitting(false);
        return;
      }

      if (!razorpayScriptLoaded) {
        razorpayScriptLoaded = true;
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => { razorpayScriptFailed = true; reject(); };
          document.body.appendChild(script);
        });
      }

      const rzp = new window.Razorpay({
        key: rzpKeyId,
        amount: Math.round(finalTotal * 100),
        currency: "INR",
        name: "My Store Grocery",
        description: `Order Payment - INR ${finalTotal}`,
        order_id: data.id,
        handler: function (response: RazorpayResponse) {
          toast.dismiss(toastId);
          orderData.razorpay_payment_id = response.razorpay_payment_id;
          orderData.razorpay_order_id = response.razorpay_order_id;
          orderData.razorpay_signature = response.razorpay_signature;
          orderData.payment = { method: "razorpay", status: "paid", ...response };
          orderData.paymentMethod = "razorpay";
          toast.success("Payment successful! Placing your order...");
          saveOrderToFirestore(orderData);
        },
        prefill: { name: name || user?.displayName || "", email: user?.email || "", contact: phone || "" },
        theme: { color: "#059669" },
        modal: {
          ondismiss: () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
            setIsLoading(false);
            setIsSubmitting(false);
          },
        },
      });
      rzp.open();
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Payment initialization failed.");
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const saveOrderToFirestore = async (orderData: Record<string, unknown>) => {
    try {
      const batch = writeBatch(db);
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const finalOrderData = {
        ...orderData,
        id: orderId,
        status: "Pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      batch.set(doc(db, "orders", orderId), finalOrderData);
      batch.set(doc(db, "users", user!.uid, "orders", orderId), finalOrderData);

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

      await batch.commit();
      if (address && deliveryOption === "delivery") saveAddress(address, location?.lat, location?.lng);
      toast.success("Order placed successfully!");
      if (clearCart) clearCart();
      router.push(`/order-success?orderId=${orderId}`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to place order. Please try again.");
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const proceedWithOrder = async () => {
    if (!user) return;

    try {
      for (const item of cartItems) {
        const productRef = doc(db, "products", item.id);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const stock = productSnap.data().stock || 0;
          if (stock < item.quantity) {
            toast.error(`"${item.name}" only ${stock} left in stock. Please update your cart.`);
            setIsSubmitting(false);
            setIsLoading(false);
            return;
          }
        }
      }

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
      const now = serverTimestamp();
      const outOfCity = deliveryOption === "delivery" && distanceKm !== null && distanceKm > MAX_DIRECT_DELIVERY_KM;

      const nowDate = new Date();
      const preparationHours = 2;
      let deliveryHours = 1;
      if (outOfCity) {
        deliveryHours = (distanceKm || 20) / 40;
      }
      const estimatedDeliveryDate = new Date(nowDate.getTime() + (preparationHours + deliveryHours) * 60 * 60 * 1000);

      const payMethod = paymentMethod === "Online" ? "razorpay" : "cod";
      const cityFromAddress = deliveryOption === "delivery" ? (address.split(",").slice(-2, -1)[0]?.trim().replace(/\d{6}/, "").trim() || "") : "Store Pickup";
      const orderData: Record<string, unknown> = {
        userId: user.uid,
        userName: name || user.displayName || "",
        userPhone: phone || "",
        userEmail: user.email || "",
        items: orderItems,
        address: {
          name, phone,
          addressLine: deliveryOption === "delivery" ? address : "Store Pickup",
          pincode: deliveryOption === "delivery" ? (address.match(/\b\d{6}\b/)?.[0] || areaCode) : "000000",
          city: cityFromAddress,
          state: "",
          lat: location?.lat || null, lng: location?.lng || null,
        },
        deliveryLocation: deliveryOption === "delivery" && location ? {
          lat: location.lat,
          lng: location.lng,
          geoHash: geoHash || "",
          distanceKm: distanceKm || 0,
          partition: deliveryZone?.partition || "",
          deliveryType: deliveryZone?.deliveryType || "own",
        } : null,
        status: "Pending",
        subtotal,
        deliveryCharge,
        taxAmount,
        couponDiscount,
        totalAmount: finalTotal,
        totalWeight,
        payment: { method: payMethod, status: "pending" },
        paymentMethod: payMethod,
        areaCode: deliveryOption === "delivery" ? (getAreaCodeFromAddress(address) || areaCode) : "PICKUP",
        outOfCity,
        estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
        createdAt: now,
        rejectionHistory: [],
        couponApplied: couponDiscount > 0 ? couponCode : null,
        phoneVerified: true,
      };

      if (paymentMethod === "Online") {
        await handleRazorpayPayment(orderData);
      } else {
        const batch = writeBatch(db);
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const orderDataWithMeta = {
          ...orderData,
          id: orderId,
          userId: user.uid,
          status: "Pending",
          payment: { method: "cod", status: "pending" },
          paymentMethod: "cod",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
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
        } catch (error: any) {
          toast.error(error?.message || "Failed to place order. Please try again.");
        }
      }
    } catch (error) {
      toast.error("An error occurred while placing your order.");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const placeOrder = async () => {
    if (isSubmitting) return;

    if (!name || name.trim().length < 2) { toast.error("Please enter your full name"); return; }
    if (!phone) { toast.error("Please enter your phone number"); return; }
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/\s/g, "").replace(/^\+91/, "").replace(/^91/, "");
    if (!phoneRegex.test(cleanPhone)) { toast.error("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"); setIsSubmitting(false); return; }
    if (deliveryOption === "delivery") {
      if (!address) { toast.error("Please enter delivery address"); return; }
      if (!address.match(/\b\d{6}\b/)) { toast.error("Please include a 6-digit pincode in your address"); return; }
      if (!location) {
        const pincode = address.match(/\b\d{6}\b/)?.[0] || "";
        const coords = pincodeToCoords(pincode);
        setLocation({ lat: coords.lat, lng: coords.lng });
        toast.info(`Location set to ${coords.city} (based on your pincode). Enable GPS for more precise delivery.`);
      }
    } else {
      setLocation({ lat: 0, lng: 0 });
      setAreaCode("PICKUP");
    }
    if (!user) { toast.error("Please login to place an order"); return; }
    if (cartItems.length === 0) { toast.error("Your cart is empty"); return; }
    if (finalTotal <= 0) { toast.error("Total must be greater than zero"); return; }

    setIsSubmitting(true);
    await proceedWithOrder();
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
                  <p className="text-sm font-medium mt-1">{opt === "delivery" ? `Delivery: ${symbol}${deliveryCharge}` : "Free pickup"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {deliveryZone && <DeliveryRadiusWarning zone={deliveryZone} symbol={symbol} thirdPartyCharge={THIRD_PARTY_DELIVERY_CHARGE} />}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
        <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2"><User className="w-5 h-5 text-emerald-600" /> Your Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl border border-gray-200 p-3 bg-gray-50/50 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-50 transition-all">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <input className="w-full bg-transparent outline-none text-gray-800 text-sm" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
          </div>
          <div className="rounded-xl border border-gray-200 p-3 bg-gray-50/50 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-50 transition-all">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5"><Phone className="w-3.5 h-3.5 inline mr-1" />Phone Number</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm font-medium">+91</span>
              <input
                className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setPhone(val);
                }}
                type="tel"
                inputMode="numeric"
                required
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">10-digit Indian mobile number starting with 6-9</p>
          </div>
        </div>
        {deliveryOption === "delivery" && (
            <>
              <div className="mb-4">
                <LocationPicker
                  onLocationSelected={handleLocationSelected}
                  disabled={isLoading}
                  storeLat={STORE_LAT}
                  storeLng={STORE_LNG}
                />
              </div>

              <AddressVerification
                address={address}
                onAddressChange={setAddress}
                onPincodeValidated={handlePincodeValidated}
                disabled={isLoading}
              />

              {location && (
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  <span className="text-[11px] text-gray-400 font-medium">
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    {distanceKm !== null && ` \u00B7 ${distanceKm} km from store`}
                    {deliveryZone && ` \u00B7 ${deliveryZone.deliveryType === "own" ? "Local delivery" : "Extended delivery"}`}
                  </span>
                </div>
              )}

              {savedAddress && (
                <SavedAddress
                  address={savedAddress}
                  onUseAddress={() => {
                    setAddress(savedAddress.address);
                    if (savedAddress.lat && savedAddress.lng) {
                      setLocation({ lat: savedAddress.lat, lng: savedAddress.lng });
                      checkDistance(savedAddress.lat, savedAddress.lng);
                    }
                  }}
                  onClearAddress={clearAddress}
                />
              )}

              {location && distanceKm !== null && (
                <div className="mt-3">
                  {(() => {
                    const storeLat = contactInfo.warehouseLat || STORE_LAT_DEFAULT;
                    const storeLng = contactInfo.warehouseLng || STORE_LNG_DEFAULT;
                    const dist_km = calculateDistance(location.lat, location.lng, storeLat, storeLng);
                    const eta = calculateDeliveryTime(dist_km, storeLat, storeLng, {
                      speedKmh: contactInfo.deliverySpeedKmph || 25,
                      trafficMultiplier: contactInfo.trafficMultiplier || 1.5,
                      handlingTimeHours: contactInfo.handlingTimeHours || 1,
                    });
                    return (
                      <div className="bg-teal-50 rounded-xl p-3 border border-teal-200">
                        <div className="flex items-center gap-2 text-teal-800 text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Estimated delivery: {eta.display}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {contactInfo.address && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h3 className="font-bold text-sm text-blue-800">Store Pickup Option</h3>
                  <p className="text-xs text-blue-600 mt-1">
                    You can also choose &quot;Store Pickup&quot; above to collect your order from our store.
                  </p>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address || "Store address not set")}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 text-sm mt-1 flex items-center gap-1 hover:underline"><MapPin className="w-3.5 h-3.5" /> {contactInfo.address || "Store address not set"}</a>
                  <p className="text-blue-600 text-sm mt-2 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pickup Hours: {contactInfo.pickupHours || "9:00 AM - 9:00 PM"}</p>
                </div>
              )}
            </>
        )}
      </div>

      {/* Coupon Code Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
        <h2 className="font-bold text-lg mb-4 text-gray-800">Coupon Code</h2>
        <div className="flex gap-2">
          <input type="text" placeholder="Enter coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="flex-1 px-3 py-2 border text-sm border-gray-200 rounded-xl outline-none focus:border-emerald-500" />
          <button onClick={applyCouponCode} disabled={couponLoading || !couponCode.trim()} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50">
            {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
          </button>
        </div>
        {couponMessage && <p className="text-xs mt-1 text-gray-500">{couponMessage}</p>}
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
        <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-600" /> Payment Method</h2>
        <div className="flex flex-wrap gap-3">
          {[["COD", "Cash on Delivery"], ["Online", "Pay Online (UPI/Card/Wallet)"]].map(([value, label]) => (
            <button key={value} onClick={() => setPaymentMethod(value)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                paymentMethod === value ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {value === "COD" ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
              {label}
            </button>
          ))}
        </div>
        {paymentMethod === "Online" && !paymentConfig?.razorpayKeyId && (
          <p className="text-xs text-amber-600 mt-2">Online payment not configured. Select Cash on Delivery to proceed.</p>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-8">
        <h2 className="font-bold text-lg mb-4 text-gray-800">Order Summary</h2>
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between py-2 border-b border-gray-50 text-sm">
            <span className="text-gray-600">{item.name} x{item.quantity}</span>
            <span className="font-medium">{symbol}{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between py-1 text-sm"><span className="text-gray-500">Subtotal</span><span>{symbol}{subtotal}</span></div>
          {deliveryOption === "delivery" && (
            <div className="flex justify-between py-1 text-sm">
              <span className="text-gray-500">Delivery</span>
              <span>{effectiveDeliveryFee === 0 ? <span className="text-emerald-600 font-semibold">Free</span> : `${symbol}${effectiveDeliveryFee}`}</span>
            </div>
          )}
          <div className="flex justify-between py-1 text-sm"><span className="text-gray-500">Tax</span><span className="font-medium">{symbol}{taxAmount}</span></div>
          {couponDiscount > 0 && (
            <div className="flex justify-between py-1 text-sm"><span className="text-green-600">Coupon Discount</span><span className="text-green-600 font-semibold">-{symbol}{couponDiscount}</span></div>
          )}
          {thirdPartyCharge > 0 && (
            <div className="flex justify-between py-1 text-sm"><span className="text-amber-600">Extended delivery fee</span><span className="text-amber-600">{symbol}{thirdPartyCharge}</span></div>
          )}
          {totalSavings > 0 && (
            <div className="flex justify-between py-1 text-xs"><span className="text-emerald-600">You saved</span><span className="text-emerald-600 font-semibold">{symbol}{totalSavings}</span></div>
          )}
          <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
            <span className="font-bold text-gray-800">Total</span>
            <span className="font-black text-xl text-emerald-700">{symbol}{finalTotal}</span>
          </div>
        </div>
        <button onClick={placeOrder} disabled={isSubmitting || cartItems.length === 0}
          className="mt-6 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Placing Order...</> : `Place Order ${symbol}${finalTotal}`}
        </button>
      </div>

      <PermissionGate />
    </div>
  );
}
