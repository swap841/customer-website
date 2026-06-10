"use client";

import React from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
} from "lucide-react";

const footerLinks = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Fruits & Vegetables", href: "/products?category=fruits-vegetables" },
    { label: "Dairy & Eggs", href: "/products?category=dairy" },
    { label: "Spices & Masala", href: "/products?category=spices" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Careers", href: "/contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/policies/privacy" },
    { label: "Terms & Conditions", href: "/policies/terms" },
    { label: "Refund Policy", href: "/policies/refund" },
    { label: "Shipping Policy", href: "/policies/shipping" },
    { label: "Contact Us", href: "/policies/contact" },
  ],
};

import { useContactInfo } from "@/hooks/useContactInfo";

export default function Footer() {
  const { contactInfo } = useContactInfo();

  return (
    <footer className="bg-zinc-900 text-zinc-300 print:hidden">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {contactInfo.logoUrl ? (
                <img src={contactInfo.logoUrl} alt={contactInfo.storeName} className="w-8 h-8 rounded-lg object-cover shadow-md" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-black">{contactInfo.storeName?.charAt(0) || "M"}</span>
                </div>
              )}
              <span className="text-lg font-black text-white">
                {contactInfo.storeName}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4 max-w-xs">
              {contactInfo.tagline || "Premium quality products, daily essentials & household items delivered fresh to your doorstep."}
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              <a 
                href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{contactInfo.phone}</span>
              </a>
              <a 
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-2 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{contactInfo.email}</span>
              </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address || "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-xs text-zinc-400 hover:text-emerald-400 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{contactInfo.address}</span>
                </a>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-4">
              {contactInfo.socialMedia?.facebook && (
                <a href={contactInfo.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-zinc-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {contactInfo.socialMedia?.instagram && (
                <a href={contactInfo.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-zinc-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              {contactInfo.footerShopTitle || "Shop"}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              {contactInfo.footerCompanyTitle || "Company"}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              {contactInfo.footerLegalTitle || "Legal"}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-zinc-400 hover:text-emerald-400 transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-zinc-500 font-medium">
            {new Date().getFullYear()} {contactInfo.storeName}. {contactInfo.copyrightText || "All rights reserved."}
          </p>
          <p className="text-xs text-zinc-500 font-medium">
            Made with care
          </p>
        </div>
      </div>
    </footer>
  );
}
