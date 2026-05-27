// app/about/page.tsx

"use client";

import React from "react";
import { Sparkles, CheckCircle2, TrendingUp, ShieldCheck } from "lucide-react";
import { useContactInfo } from "@/hooks/useContactInfo";

export default function AboutPage() {
  const { contactInfo } = useContactInfo();

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            🌱 About {contactInfo.storeName}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-semibold max-w-xl mx-auto">
            {contactInfo.tagline || "Delivering farm-fresh organic produce, daily essentials, and household products straight to your doorstep."}
          </p>
        </div>

        {/* Story Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xl p-8 md:p-12 text-white">
          <div className="absolute inset-0 bg-black/5 pointer-events-none" />
          <div className="relative space-y-4 max-w-xl">
            <span className="text-xs font-black uppercase bg-white/20 px-2.5 py-1 rounded-full tracking-wider">Our Story</span>
            <h2 className="text-2xl font-black md:text-3xl">Bridging the Gap between Farmers & Families</h2>
            <p className="text-emerald-50 text-sm leading-relaxed">
              {contactInfo.aboutText || `Founded in 2026, ${contactInfo.storeName} started with a simple, disruptive idea: cut out the middleman and logistics delays. We select produce directly from local farm collectives, package them in local dispatch centers under strict food safety checks, and deliver them to your kitchen.`}
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 p-6 rounded-2xl space-y-3 shadow-xs">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-zinc-900 dark:text-white">Farm Fresh</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
              Harvested at dawn and delivered to your doorstep within hours. Never cold-stored for weeks.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 p-6 rounded-2xl space-y-3 shadow-xs">
            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-zinc-900 dark:text-white">Strict Quality</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
              Multi-point quality checks ensure only organic, clean, and prime groceries enter your basket.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 p-6 rounded-2xl space-y-3 shadow-xs">
            <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-zinc-900 dark:text-white">Fair Pricing</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
              By working directly with growers, we guarantee better earnings for farmers and lower bills for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
