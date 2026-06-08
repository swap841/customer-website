'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { app } from "@/firebaseConfig";
import { useCart } from "@/components/CartContext";
import { requestFcmToken } from "@/lib/firebaseMessaging";
import {
  ShoppingCart,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Home,
  ShoppingBag,
  Phone,
  Mail,
  Info,
  ChevronDown,
  MessageCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useContactInfo } from "@/hooks/useContactInfo";

const auth = getAuth(app);

export default function Navbar() {
  const { contactInfo } = useContactInfo();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => setMounted(true), []);
  const pathname = usePathname();

  const { totalItems, subtotal, openCart } = useCart();
  const symbol = contactInfo.currencySymbol || "\u20B9";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        requestFcmToken(currentUser.uid).catch(() => {});
      }
    });
    return () => unsubscribe();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdown(false);
  }, [pathname]);

  const logoutUser = async () => {
    await signOut(auth);
    setProfileDropdown(false);
    router.push("/products");
  };

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Products", href: "/products", icon: ShoppingBag },
    { label: "About", href: "/about", icon: Info },
    { label: "FAQ", href: "/faq", icon: MessageCircle },
    { label: "Contact", href: "/contact", icon: Phone },
  ];

  const isActive = (href: string) =>
    pathname === href
      ? "text-emerald-600 dark:text-emerald-400 font-bold"
      : "text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400";

  return (
    <nav className="w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 fixed top-0 left-0 z-50 shadow-sm">
      {/* Premium Dynamic Support Bar */}
      <div className="hidden sm:block bg-emerald-600 text-white text-xs font-semibold py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`} className="flex items-center gap-1.5 hover:text-emerald-100 transition">
              <Phone className="w-3 h-3" />
              <span>{contactInfo.phone}</span>
            </a>
            <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-1.5 hover:text-emerald-100 transition">
              <Mail className="w-3 h-3" />
              <span>{contactInfo.email}</span>
            </a>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-100">
            {contactInfo.tagline || "Premium Quality, Delivered Fresh"}
          </span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ─── Logo ─── */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
          >
            {contactInfo.logoUrl ? (
              <img src={contactInfo.logoUrl} alt={contactInfo.storeName} className="w-8 h-8 rounded-lg object-cover shadow-md" />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-black">{contactInfo.storeName?.charAt(0) || "M"}</span>
              </div>
            )}
            <span className="text-lg font-black bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent hidden sm:block">
              {contactInfo.storeName}
            </span>
          </Link>

          {/* ─── Desktop Nav Links ─── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive(link.href)} hover:bg-emerald-50 dark:hover:bg-emerald-900/30`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ─── Right Section ─── */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Dark Mode Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-zinc-600" />
                )}
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100"
              aria-label="Open shopping cart"
            >
              <ShoppingCart className="w-5 h-5" />
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-semibold text-emerald-600 leading-tight">
                  {totalItems === 0 ? "Cart" : `${totalItems} Item${totalItems > 1 ? "s" : ""}`}
                </span>
                <span className="text-sm font-bold leading-tight">{symbol}{subtotal}</span>
              </div>
              {/* Badge */}
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center sm:hidden">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-zinc-50 transition-colors border border-transparent hover:border-zinc-100"
                >
                  <Image
                    src={user.photoURL || "/fallback-image.png"}
                    width={32}
                    height={32}
                    alt="Profile"
                    className="rounded-full ring-2 ring-emerald-200"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
                </button>

                {/* Profile Dropdown */}
                  {profileDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-zinc-400" />
                        My Profile
                      </Link>
                      <button
                        onClick={logoutUser}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-zinc-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-zinc-700" />
              ) : (
                <Menu className="w-5 h-5 text-zinc-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mobile Menu ─── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isActive(link.href)} hover:bg-emerald-50 dark:hover:bg-emerald-900/30`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close profile dropdown */}
      {profileDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProfileDropdown(false)}
        />
      )}
    </nav>
  );
}