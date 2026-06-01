// app/policies/[type]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

const POLICY_TITLES: Record<string, string> = {
  shipping: "Shipping Policy",
  refund: "Refund Policy",
  privacy: "Privacy Policy",
  terms: "Terms & Conditions",
  contact: "Contact Us",
};

export default function PolicyPage() {
  const params = useParams();
  const type = params.type as string;
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (type) loadPolicy();
  }, [type]);

  const loadPolicy = async () => {
    try {
      const snap = await getDoc(doc(db, "policies", type));
      if (snap.exists()) {
        setContent(snap.data().content || "No content available.");
      } else {
        setContent("No content available.");
      }
    } catch {
      setContent("Failed to load policy.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {POLICY_TITLES[type] || "Policy"}
            </h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="prose prose-zinc dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
