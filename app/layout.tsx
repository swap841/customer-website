import "./globals.css";
import { CartProvider } from "../components/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import { QueryProvider } from "../lib/queryProvider";
import { ThemeProvider } from "../lib/themeProvider";
import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import DynamicBranding from "@/components/DynamicBranding";
import StoreStatusGate from "@/components/StoreStatusGate";
import ChatBot from "@/components/ChatBot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Store — Fresh Groceries Delivered Fast",
  description:
    "Order farm-fresh organic produce, daily essentials & household items online. Fast delivery to your doorstep within 24 hours.",
  keywords: [
    "grocery", "delivery", "fresh produce", "organic", "online grocery",
    "My Store", "farm fresh", "Satara", "India",
  ],
  openGraph: {
    title: "My Store — Fresh Groceries Delivered Fast",
    description:
      "Order farm-fresh organic produce, daily essentials & household items online. Fast delivery to your doorstep within 24 hours.",
    type: "website",
    siteName: "My Store",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans antialiased bg-gray-50 dark:bg-zinc-950 dark:text-white">
        <ThemeProvider>
          <QueryProvider>
            <CartProvider>
              <StoreStatusGate>
                <Navbar />
                <main className="pt-16 md:pt-24 min-h-screen"><DynamicBranding>{children}</DynamicBranding></main>
                <Footer />
                <CartDrawer />
                <ChatBot />
              </StoreStatusGate>
              <Toaster
                position="bottom-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "13px",
                    fontWeight: "600",
                  },
                }}
              />
            </CartProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
