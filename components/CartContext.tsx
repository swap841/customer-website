"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { db, auth } from "@/firebaseConfig";
import {
  collection,
  doc,
  onSnapshot,
  writeBatch,
  getDocs,
  query,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  weight?: number;
  unit?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  imageUrl?: string;
  description?: string;
  weight?: number;
  unit?: string;
  stock?: number;
  categoryId?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  totalItems: number;
  subtotal: number;
  deliveryCharge: number;
  deliveryChargeConfig: number;
  taxAmount: number;
  grandTotal: number;

  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  couponCode: string;
  setCouponCode: (code: string) => void;
  couponDiscount: number;
  applyCoupon: () => Promise<void>;
  couponMessage: string | null;
  couponLoading: boolean;

  taxPercentage: number;
  setTaxPercentage: (pct: number) => void;
  freeDeliveryThreshold: number;
  setFreeDeliveryThreshold: (val: number) => void;

  isSyncing: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

function cartItemToFirestore(item: CartItem) {
  return {
    productId: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    imageUrl: item.imageUrl || "",
    weight: item.weight || 0,
    unit: item.unit || "",
    updatedAt: serverTimestamp(),
  };
}

function firestoreDocToCartItem(id: string, data: Record<string, unknown>): CartItem {
  return {
    id: data.productId as string || id,
    name: (data.name as string) || "",
    price: (data.price as number) || 0,
    quantity: (data.quantity as number) || 1,
    imageUrl: data.imageUrl as string | undefined,
    weight: data.weight as number | undefined,
    unit: data.unit as string | undefined,
  };
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const [taxPercentage, setTaxPercentage] = useState(5);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(100);
  const [deliveryChargeConfig, setDeliveryCharge] = useState(25);

  const [user, setUser] = useState<{ uid: string } | null>(null);

  const isFromSnapshot = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialSyncDone = useRef(false);
  const unsubSnapshot = useRef<(() => void) | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted]);

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser ? { uid: currentUser.uid } : null);
      if (!currentUser) {
        initialSyncDone.current = false;
        setIsSyncing(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync delivery charge, tax, and free delivery threshold from Firestore config
  useEffect(() => {
    async function syncConfig() {
      try {
        const snap = await getDoc(doc(db, "appConfig", "settings"));
        if (snap.exists()) {
          const cfg = snap.data() as any;
          if (cfg.store?.deliveryCharge != null) setDeliveryCharge(cfg.store.deliveryCharge);
          if (cfg.store?.taxPercent != null) setTaxPercentage(cfg.store.taxPercent);
          if (cfg.store?.freeDeliveryAbove != null) setFreeDeliveryThreshold(cfg.store.freeDeliveryAbove);
        }
      } catch { /* optional */ }
    }
    syncConfig();
  }, []);

  // Listen to Firestore cart when user is logged in
  useEffect(() => {
    if (!user) {
      if (unsubSnapshot.current) {
        unsubSnapshot.current();
        unsubSnapshot.current = null;
      }
      return;
    }

    setIsSyncing(true);

    const cartRef = collection(db, "users", user.uid, "cart");
    const q = query(cartRef);

    const unsub = onSnapshot(q, (snapshot) => {
      const serverItems: CartItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        serverItems.push(firestoreDocToCartItem(docSnap.id, data));
      });

      isFromSnapshot.current = true;

      setCartItems((prev) => {
        if (!initialSyncDone.current) {
          initialSyncDone.current = true;
          // Merge: server takes priority for item data, keep higher quantity
          const merged = [...serverItems];
          for (const localItem of prev) {
            const existing = merged.find((m) => m.id === localItem.id);
            if (existing) {
              existing.quantity = Math.max(existing.quantity, localItem.quantity);
            } else {
              merged.push(localItem);
            }
          }
          setIsSyncing(false);
          return merged;
        }
        // After initial sync, server wins if this update came from another tab/session
        if (serverItems.length > 0 || prev.length === 0) {
          setIsSyncing(false);
          return serverItems;
        }
        setIsSyncing(false);
        return prev;
      });
    });

    unsubSnapshot.current = unsub;

    return () => {
      unsub();
      unsubSnapshot.current = null;
    };
  }, [user]);

  // Debounced push to Firestore when cart changes locally
  const pushToFirestore = useCallback((items: CartItem[]) => {
    if (!user) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      if (!user) return;
      const batch = writeBatch(db);
      const cartRef = collection(db, "users", user.uid, "cart");

      // Delete all existing and re-add
      const existingDocs = await getDocs(query(cartRef));
      existingDocs.forEach((docSnap) => {
        batch.delete(doc(cartRef, docSnap.id));
      });

      for (const item of items) {
        const docRef = doc(cartRef);
        batch.set(docRef, cartItemToFirestore(item));
      }

      try {
        await batch.commit();
      } catch (error) {
        // Cart sync error handled silently
      }
    }, 300);
  }, [user]);

  // When cartItems change locally (not from snapshot), push to Firestore
  useEffect(() => {
    if (isFromSnapshot.current) {
      isFromSnapshot.current = false;
      return;
    }
    if (!initialSyncDone.current) return;
    if (!user) return;

    pushToFirestore(cartItems);
  }, [cartItems, user, pushToFirestore]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl,
          weight: product.weight,
          unit: product.unit,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode("");
    setCouponDiscount(0);
    setCouponMessage(null);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const deliveryCharge = subtotal >= freeDeliveryThreshold ? 0 : deliveryChargeConfig;
  const taxAmount = Math.round((subtotal * taxPercentage) / 100);
  const grandTotal = Math.max(subtotal + deliveryCharge + taxAmount - couponDiscount, 0);

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      setCouponMessage("Enter a coupon code");
      return;
    }
    setCouponLoading(true);
    setCouponMessage(null);
    try {
      const { validateCoupon } = await import("../utils/coupon");
      const result = await validateCoupon(code, subtotal);
      if (!result.valid) {
        setCouponDiscount(0);
        setCouponMessage(result.error || "Invalid coupon");
      } else {
        setCouponDiscount(result.discount || 0);
        setCouponMessage(`Coupon applied! Discount: ${result.discount?.toFixed(0)}`);
      }
    } catch {
      setCouponDiscount(0);
      setCouponMessage("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        deliveryCharge,
        deliveryChargeConfig,
        taxAmount,
        grandTotal,
        isCartOpen,
        openCart,
        closeCart,
        couponCode,
        setCouponCode,
        couponDiscount,
        applyCoupon,
        couponMessage,
        couponLoading,
        taxPercentage,
        setTaxPercentage,
        freeDeliveryThreshold,
        setFreeDeliveryThreshold,
        isSyncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
