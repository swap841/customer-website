"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const [taxPercentage, setTaxPercentage] = useState(5);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(100);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isMounted]);

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

  const deliveryCharge = subtotal >= freeDeliveryThreshold ? 0 : 25;
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
        setCouponMessage(`Coupon applied! -₹${result.discount?.toFixed(0)}`);
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
