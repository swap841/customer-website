import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "@/components/CartContext";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const mockProduct = {
  id: "prod-1",
  name: "Test Product",
  price: 50,
  mrp: 70,
  imageUrl: "/test.jpg",
  weight: 500,
  unit: "g",
};

const mockProduct2 = {
  id: "prod-2",
  name: "Cheap Item",
  price: 10,
};

beforeEach(() => {
  localStorage.clear();
});

describe("CartContext", () => {
  describe("addToCart", () => {
    it("adds a new item to the cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => result.current.addToCart(mockProduct));

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0]).toMatchObject({
        id: "prod-1",
        name: "Test Product",
        price: 50,
        quantity: 1,
      });
    });

    it("increments quantity when the same product is added twice", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => result.current.addToCart(mockProduct));
      act(() => result.current.addToCart(mockProduct));

      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].quantity).toBe(2);
    });
  });

  describe("removeFromCart", () => {
    it("removes an item from the cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => result.current.addToCart(mockProduct));
      act(() => result.current.addToCart(mockProduct2));
      expect(result.current.cartItems).toHaveLength(2);

      act(() => result.current.removeFromCart("prod-1"));
      expect(result.current.cartItems).toHaveLength(1);
      expect(result.current.cartItems[0].id).toBe("prod-2");
    });

    it("does nothing when removing a non-existent item", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => result.current.addToCart(mockProduct));
      act(() => result.current.removeFromCart("non-existent"));

      expect(result.current.cartItems).toHaveLength(1);
    });
  });

  describe("updateQuantity", () => {
    it("updates the quantity of an existing item", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => result.current.addToCart(mockProduct));
      act(() => result.current.updateQuantity("prod-1", 5));

      expect(result.current.cartItems[0].quantity).toBe(5);
    });

    it("removes the item when quantity is set to 0", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => result.current.addToCart(mockProduct));
      act(() => result.current.updateQuantity("prod-1", 0));

      expect(result.current.cartItems).toHaveLength(0);
    });
  });

  describe("clearCart", () => {
    it("removes all items from the cart", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => result.current.addToCart(mockProduct));
      act(() => result.current.addToCart(mockProduct2));
      expect(result.current.cartItems).toHaveLength(2);

      act(() => result.current.clearCart());
      expect(result.current.cartItems).toHaveLength(0);
    });
  });

  describe("total calculations", () => {
    it("totalItems sums quantities", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => result.current.addToCart(mockProduct));
      act(() => result.current.addToCart(mockProduct));
      act(() => result.current.addToCart(mockProduct2));

      expect(result.current.totalItems).toBe(3);
    });

    it("subtotal sums price * quantity", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => result.current.addToCart(mockProduct)); // 50
      act(() => result.current.addToCart(mockProduct)); // 50
      act(() => result.current.addToCart(mockProduct2)); // 10

      expect(result.current.subtotal).toBe(110);
    });

    it("applies delivery charge when subtotal < 100", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => result.current.addToCart(mockProduct2)); // price 10

      expect(result.current.subtotal).toBe(10);
      expect(result.current.deliveryCharge).toBe(25);
      expect(result.current.taxAmount).toBe(1); // 5% of 10 = 0.5, rounded to 1
      expect(result.current.grandTotal).toBe(10 + 25 + 1);
    });

    it("waives delivery charge when subtotal >= 100", () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      act(() => result.current.addToCart(mockProduct)); // price 50
      act(() => result.current.addToCart(mockProduct)); // 50

      expect(result.current.subtotal).toBe(100);
      expect(result.current.deliveryCharge).toBe(0);
      expect(result.current.taxAmount).toBe(5); // 5% of 100
      expect(result.current.grandTotal).toBe(100 + 0 + 5);
    });
  });
});
