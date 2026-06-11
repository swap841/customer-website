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
import DynamicSEO from "@/components/DynamicSEO";
import { fetchConfig } from "@/lib/configFetcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await fetchConfig();
  const name = config.storeName || "My Store Grocery";
  return {
    title: {
      default: `${name} - Fresh Groceries Delivered`,
      template: `%s | ${name}`,
    },
    description: config.aboutText || `Order fresh groceries online from ${name}. Get same-day delivery of fruits, vegetables, dairy, and more.`,
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: name,
      title: name,
      description: config.aboutText || `Order fresh groceries online from ${name}.`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const config = await fetchConfig();

  const configScript = `
    window.__APP_CONFIG__ = ${JSON.stringify(config)};
  `;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href={config.storeFavicon || "/favicon.ico"} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content={config.primaryColor} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <script
          id="__APP_CONFIG__"
          dangerouslySetInnerHTML={{
            __html: configScript,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-gray-50 dark:bg-zinc-950 dark:text-white">
        <ThemeProvider>
          <QueryProvider>
            <CartProvider>
              <StoreStatusGate>
                <DynamicSEO />
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