"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { getAuth } from "firebase/auth";
import { getAreaCode, getAreaCodeFromAddress } from "../utils/getAreaCode";
import { getDistanceKm } from "@/utils/distance";
import { doc, setDoc, collection, writeBatch, increment, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { validateCoupon } from "../utils/coupon";
import TimeSlotPicker, { type TimeSlot } from "./TimeSlotPicker";
import LocationPicker from "./LocationPicker";
import AddressVerification from "./AddressVerification";
import DeliveryRadiusWarning from "./DeliveryRadiusWarning";
import PermissionGate from "./PermissionGate";
import PermissionDialog from "./PermissionDialog";
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
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Phone,
  Mail,
  User,
  Clock,
  Shield,
} from "lucide-react";
import { requestFcmToken, sendCheckoutOTP, verifyCheckoutOTP } from "@/lib/firebaseMessaging";
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
  const [preferredSlot, setPreferredSlot] = useState<TimeSlot>("morning");
  const [paymentConfig, setPaymentConfig] = useState<any>(null);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZoneInfo | null>(null);
  const [pincodeValidated, setPincodeValidated] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [showPermissionGate, setShowPermissionGate] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const { savedAddress, saveAddress, clearAddress } = useAddress();

  const [otpStep, setOtpStep] = useState<"idle" | "sending" | "input" | "verifying" | "verified" | "failed">("idle");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(0);

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
    getAppConfig(true).then(cfg => setPaymentConfig(cfg.payment || {})).catch(() => {});
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

  useEffect(() => {
    if (otpStep === "sending" && user && phone) {
      const requestOTP = async () => {
        const cleanPhoneForOTP = phone.replace(/\s/g, "").replace(/^\+91/, "").replace(/^91/, "");
        const result = await sendCheckoutOTP(cleanPhoneForOTP, user.uid);
        if (result.success) {
          setOtpStep("input");
          setOtpCountdown(60);
        } else {
          setOtpStep("failed");
          setOtpError(result.error || "Failed to send OTP");
        }
      };
      requestOTP();
    }
  }, [otpStep, user, phone]);

  useEffect(() => {
    if (otpCountdown > 0) {
      timerRef.current = setTimeout(() => setOtpCountdown(prev => prev - 1), 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [otpCountdown]);

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
  }, []);

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
    } catch (error) {
      // Profile update error handled silently
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
        setCouponMessage(`Coupon applied! Discount ${symbol}${result.discount?.toFixed(0)}`);
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
      const orderId = ordersRef.id;
      const orderPayload = {
        ...orderData,
        id: orderId,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const batch = writeBatch(db);
      batch.set(doc(db, "orders", orderId), orderPayload);
      batch.set(doc(db, "users", user.uid, "orders", orderId), orderPayload);
      await batch.commit();
      return orderId;
    } catch (error) {
      // Order save error handled silently
      return null;
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) { resolve(true); return; }
      if (razorpayScriptFailed) { resolve(false); return; }
      if (razorpayScriptLoaded) { resolve(false); return; }
      razorpayScriptLoaded = true;
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => { razorpayScriptFailed = true; resolve(false); };
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
        name: contactInfo.storeName || "My Store Grocery",
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
              const fallbackId = await saveOrderToFirestore(orderData);
              toast.dismiss(paymentToastId);
              if (fallbackId) {
                toast.success("Order saved locally.");
                router.push(`/order-success?orderId=${fallbackId}`);
              } else {
                setIsSubmitting(false);
                setIsLoading(false);
                toast.error("Payment received but order saving failed.");
              }
            }
          } catch (error) {
            // Payment verification error handled silently
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
      // Razorpay error handled silently
      toast.dismiss(toastId);
      toast.error("Payment initialization failed.");
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!user || !phone || otpCode.length !== 4) return;
    
    setOtpStep("verifying");
    setOtpError(null);
    
    const cleanPhoneForVerify = phone.replace(/\s/g, "").replace(/^\+91/, "").replace(/^91/, "");
    const result = await verifyCheckoutOTP(cleanPhoneForVerify, otpCode, user.uid);
    
    if (result.success) {
      setOtpStep("verified");
      setTimeout(() => {
        proceedWithOrder();
      }, 500);
    } else {
      setOtpAttempts(prev => prev + 1);
      setOtpStep("input");
      setOtpError(result.error || "OTP verification failed");
      setOtpCode("");
      
      if (otpAttempts >= 2) {
        setOtpError("Too many failed attempts. Please check your phone number.");
      }
    }
  };

  const handleResendOTP = async () => {
    if (!user || !phone) return;
    setOtpStep("sending");
    setOtpCode("");
    setOtpError(null);
    setOtpAttempts(0);
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
        deliveryTimeSlot: preferredSlot,
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
      setOtpStep("idle");
    }
  };

  const placeOrder = async () => {
    if (isSubmitting) return;

    // Check permissions before placing order
    if (deliveryOption === "delivery") {
      const locPermission = await navigator.permissions.query({ name: "geolocation" }).catch(() => ({ state: "prompt" }));
      const notifPermission = typeof Notification !== "undefined" ? Notification.permission : "granted";
      
      if (locPermission.state !== "granted") {
        setShowPermissionGate(true);
        setIsSubmitting(false);
        setIsLoading(false);
        return;
      }
      if (notifPermission !== "granted") {
        setShowPermissionGate(true);
        setIsSubmitting(false);
        setIsLoading(false);
        return;
      }
    }

    // Check notification permission
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      setShowNotificationDialog(true);
      setIsSubmitting(false);
      return;
    }

    if (!name || name.trim().length < 2) { toast.error("Please enter your full name"); return; }
    if (!phone) { toast.error("Please enter your phone number"); return; }
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/\s/g, "").replace(/^\+91/, "").replace(/^91/, "");
    if (!phoneRegex.test(cleanPhone)) { toast.error("Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"); setIsSubmitting(false); return; }
    if (deliveryOption === "delivery") {
      if (!location) { toast.error("Please set your delivery location"); return; }
      if (!address) { toast.error("Please enter delivery address"); return; }
      if (!address.match(/\b\d{6}\b/)) { toast.error("Please include a 6-digit pincode in your address"); return; }
    } else {
      setLocation({ lat: 0, lng: 0 });
      setAreaCode("PICKUP");
    }
    if (!user) { toast.error("Please login to place an order"); return; }
    if (cartItems.length === 0) { toast.error("Your cart is empty"); return; }
    if (finalTotal <= 0) { toast.error("Total must be greater than zero"); return; }

    setIsSubmitting(true);

    try {
      await requestFcmToken(user.uid);
      setOtpStep("sending");
      setOtpError(null);
      setOtpAttempts(0);
      setOtpCode("");
    } catch (err) {
      toast.error("Failed to initiate verification. Please try again.");
      setIsSubmitting(false);
    }
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
                    const dist = calculateDistance(storeLat, storeLng, location.lat, location.lng);
                    const estimate = calculateDeliveryTime(dist, storeLat, storeLng);
                    return estimate ? (
                      <div className={`p-3 rounded-xl text-sm font-medium ${estimate.isOutOfRadius ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        🚚 Estimated delivery: {estimate.display}
                        {estimate.isOutOfRadius && (
                          <p className="text-xs mt-1">This order will be dispatched via delivery partner.</p>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </>
          )}
          {deliveryOption === "pickup" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-lg mr-3"><Store className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <h3 className="font-semibold text-blue-800">Store Pickup Information</h3>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address || "Store address not set")}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 text-sm mt-1 flex items-center gap-1 hover:underline"><MapPin className="w-3.5 h-3.5" /> {contactInfo.address || "Store address not set"}</a>
                  <p className="text-blue-600 text-sm mt-2 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pickup Hours: {contactInfo.pickupHours || "9:00 AM - 9:00 PM"}</p>
                </div>
              </div>
            </div>
          )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
        <h2 className="font-bold text-lg mb-4 text-gray-800">Bill Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2"><span className="text-gray-600">Items total ({cartItems.length} items)</span><span className="font-medium">{symbol}{subtotal}</span></div>
          {deliveryOption === "delivery" && (
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Delivery</span>
              <span className="font-medium">{effectiveDeliveryFee === 0 ? <span className="text-blue-600 font-semibold">FREE</span> : `${symbol}${effectiveDeliveryFee}`}</span>
            </div>
          )}
          <div className="flex justify-between py-2"><span className="text-gray-600">Tax</span><span className="font-medium">{symbol}{taxAmount}</span></div>
          {isThirdPartyDelivery && deliveryOption === "delivery" && (
            <div className="flex justify-between py-2 text-amber-700"><span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Extended distance fee</span><span className="font-medium">{symbol}{THIRD_PARTY_DELIVERY_CHARGE}</span></div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between py-2 text-emerald-600 font-semibold"><span>Coupon discount</span><span>-{symbol}{couponDiscount}</span></div>
          )}
          <div className="border-t pt-3 mt-2">
            <div className="flex justify-between font-bold text-lg"><span>Grand Total</span><span className="text-emerald-600">{symbol}{finalTotal}</span></div>
          </div>
          {deliveryOption === "delivery" && totalSavings > 0 && (
            <div className="bg-emerald-50 rounded-xl p-3 mt-3">
              <p className="text-emerald-700 text-sm flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> You saved {symbol}{totalSavings} on delivery!</p>
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
          {paymentConfig?.codEnabled !== false && (
            <div
              className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${paymentMethod === "COD" ? "border-emerald-500 bg-emerald-50 shadow-md" : "border-gray-300 hover:bg-gray-50"}`}
              onClick={() => setPaymentMethod("COD")}
            >
              <label className="flex items-center cursor-pointer">
                <input type="radio" className="h-5 w-5 text-emerald-600 accent-emerald-600" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} />
                <div className="ml-3">
                  <span className="text-gray-800 font-medium flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-emerald-600" /> Cash on Delivery
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Pay when you receive your order</p>
                </div>
              </label>
            </div>
          )}
          {paymentConfig?.razorpayEnabled && paymentConfig?.razorpayKeyId && (
            <div
              className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${paymentMethod === "Online" ? "border-emerald-500 bg-emerald-50 shadow-md" : "border-gray-300 hover:bg-gray-50"}`}
              onClick={() => setPaymentMethod("Online")}
            >
              <label className="flex items-center cursor-pointer">
                <input type="radio" className="h-5 w-5 text-emerald-600 accent-emerald-600" checked={paymentMethod === "Online"} onChange={() => setPaymentMethod("Online")} />
                <div className="ml-3">
                  <span className="text-gray-800 font-medium flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" /> Pay Online (Razorpay)
                  </span>
                  <p className="text-xs text-gray-500 mt-1">UPI, Cards, Netbanking</p>
                </div>
              </label>
            </div>
          )}
          {paymentConfig && paymentConfig?.codEnabled === false && !(paymentConfig?.razorpayEnabled && paymentConfig?.razorpayKeyId) && (
            <div className="rounded-xl border-2 border-gray-300 p-4 bg-gray-50">
              <p className="text-gray-500 text-sm text-center">No payment methods available</p>
            </div>
          )}
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
        {couponDiscount > 0 && <p className="mt-2 text-sm text-emerald-700">Discount applied: {symbol}{couponDiscount.toFixed(0)}</p>}
      </div>

      <button onClick={placeOrder} disabled={isLoading || isSubmitting || (paymentMethod === "COD" && paymentConfig?.codEnabled === false) || (paymentMethod === "Online" && (!paymentConfig?.razorpayEnabled || !paymentConfig?.razorpayKeyId))}
        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {isLoading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> {paymentMethod === "Online" ? "Opening Payment Gateway..." : "Placing Order..."}</>
        ) : (
          <>{paymentMethod === "Online" ? `Pay ${symbol}${finalTotal} with Razorpay` : `Place Order - ${symbol}${finalTotal}`}</>
        )}
      </button>
      {showPermissionGate && (
  <PermissionGate
    onGranted={() => { setPermissionsGranted(true); setShowPermissionGate(false); }}
    onClose={() => { setShowPermissionGate(false); setIsSubmitting(false); }}
  />
)}

      <PermissionDialog
        isOpen={showNotificationDialog}
        onClose={() => { setShowNotificationDialog(false); setIsSubmitting(false); }}
        onConfirm={async () => {
          const result = await Notification.requestPermission();
          setShowNotificationDialog(false);
          if (result === "granted") {
            await requestFcmToken(user!.uid);
          }
          // Proceed with order regardless
          setOtpStep("sending");
        }}
        title="Get Delivery Updates?"
        message="We'll notify you when your order is confirmed, out for delivery, and delivered."
        icon="notification"
        confirmText="Enable Notifications"
        cancelText="Skip"
      />

      {otpStep !== "idle" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            {otpStep === "sending" && (
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-gray-900">Sending OTP</h2>
                <p className="text-sm text-gray-500 mt-1">Sending verification code to +91 {phone}</p>
                <p className="text-xs text-gray-400 mt-2">You&apos;ll receive a notification with the code</p>
              </div>
            )}
            
            {otpStep === "input" && (
              <div>
                <div className="text-center mb-4">
                  <Shield className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <h2 className="text-lg font-bold text-gray-900">Verify Your Phone</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter the 4-digit code sent to +91 {phone}
                  </p>
                  <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-xs text-emerald-700 font-medium">
                      📱 Check your browser notifications for the OTP code
                    </p>
                    <p className="text-[10px] text-emerald-600 mt-1">
                      Look for a notification pop-up on your screen
                    </p>
                  </div>
                </div>
                
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setOtpCode(val);
                    setOtpError(null);
                  }}
                  placeholder="0000"
                  autoFocus
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-3"
                />
                
                {otpError && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-600">{otpError}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handleResendOTP}
                    disabled={otpCountdown > 0}
                    className="text-sm text-emerald-600 disabled:text-gray-400 font-semibold"
                  >
                    {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : "Resend OTP"}
                  </button>
                  <span className="text-xs text-gray-400">{otpAttempts}/3 attempts</span>
                </div>
                
                <button
                  onClick={handleVerifyOTP}
                  disabled={otpCode.length !== 4 || otpAttempts >= 3}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify & Place Order
                </button>
              </div>
            )}
            
            {otpStep === "verifying" && (
              <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-gray-900">Verifying OTP</h2>
                <p className="text-sm text-gray-500 mt-1">Please wait...</p>
              </div>
            )}
            
            {otpStep === "verified" && (
              <div className="text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h2 className="text-lg font-bold text-gray-900">Verified!</h2>
                <p className="text-sm text-gray-500 mt-1">Placing your order...</p>
              </div>
            )}
            
            {otpStep === "failed" && (
              <div>
                <div className="text-center mb-4">
                  <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                  <h2 className="text-lg font-bold text-gray-900">Verification Failed</h2>
                  <p className="text-sm text-red-500 mt-1">{otpError}</p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => { setOtpStep("sending"); setOtpError(null); }}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => { setOtpStep("idle"); setIsSubmitting(false); }}
                    className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
