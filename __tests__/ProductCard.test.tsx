import { render, screen } from "@testing-library/react";
import { CartProvider } from "@/components/CartContext";
import ProductCard from "@/components/ProductCard";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const baseProduct = {
  id: "prod-1",
  name: "Organic Apples",
  price: 80,
  mrp: 100,
  imageUrl: "/apples.jpg",
  weight: 500,
  unit: "g",
  stock: 10,
};

describe("ProductCard", () => {
  it("renders product name and price", () => {
    render(<ProductCard product={baseProduct} />, { wrapper });
    expect(screen.getByText("Organic Apples")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
  });

  it("shows discount badge when mrp > price", () => {
    render(<ProductCard product={baseProduct} />, { wrapper });
    expect(screen.getByText("20% OFF")).toBeInTheDocument();
  });

  it("shows discount percentage badge when discounted", () => {
    render(<ProductCard product={baseProduct} />, { wrapper });
    expect(screen.getByText("20% OFF")).toBeInTheDocument();
  });

  it("does not show discount badge when mrp equals price", () => {
    const noDiscount = { ...baseProduct, mrp: 80 };
    render(<ProductCard product={noDiscount} />, { wrapper });
    expect(screen.queryByText(/% OFF/)).not.toBeInTheDocument();
    expect(screen.queryByText(/You save/)).not.toBeInTheDocument();
  });

  it("shows 'Sold Out' when stock is 0", () => {
    const outOfStock = { ...baseProduct, stock: 0 };
    render(<ProductCard product={outOfStock} />, { wrapper });
    expect(screen.getByText("Sold Out")).toBeInTheDocument();
  });

  it("shows 'Sold Out' when stock is negative", () => {
    const outOfStock = { ...baseProduct, stock: -1 };
    render(<ProductCard product={outOfStock} />, { wrapper });
    expect(screen.getByText("Sold Out")).toBeInTheDocument();
  });

  it("shows ADD button when not in cart and in stock", () => {
    render(<ProductCard product={baseProduct} />, { wrapper });
    expect(screen.getByText("ADD")).toBeInTheDocument();
  });

  it("renders weight when provided", () => {
    render(<ProductCard product={baseProduct} />, { wrapper });
    expect(screen.getByText("500g")).toBeInTheDocument();
  });

  it("renders product image", () => {
    render(<ProductCard product={baseProduct} />, { wrapper });
    const img = screen.getByAltText("Organic Apples");
    expect(img).toBeInTheDocument();
  });

  it("shows 'No Image' placeholder when imageUrl is missing", () => {
    const noImg = { ...baseProduct, imageUrl: undefined };
    render(<ProductCard product={noImg} />, { wrapper });
    expect(screen.getByText("No Image")).toBeInTheDocument();
  });

  it("links to product detail page", () => {
    render(<ProductCard product={baseProduct} />, { wrapper });
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/products/prod-1");
  });
});
