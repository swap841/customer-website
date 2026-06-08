"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useContactInfo } from "@/hooks/useContactInfo";
import { Building2, Target, Eye, Award, Calendar, Users, Sparkles } from "lucide-react";

export default function AboutPage() {
  const { contactInfo } = useContactInfo();
  const [aboutUs, setAboutUs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "appConfig", "settings"));
        if (snap.exists() && snap.data().aboutUs) {
          setAboutUs(snap.data().aboutUs);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const storeName = contactInfo.storeName || "MyStore";
  const story = aboutUs?.story || contactInfo.aboutText || `Founded in 2026, ${storeName} started with a simple idea: cut out the middleman and deliver farm-fresh groceries straight to your kitchen.`;
  const mission = aboutUs?.mission || "To make grocery shopping convenient, affordable, and reliable for every household.";
  const vision = aboutUs?.vision || "To become the most trusted local grocery delivery service in your neighborhood.";
  const foundingDate = aboutUs?.foundingDate || "2020-01-01";
  const achievements: string[] = aboutUs?.achievements || [];
  const teamSize = aboutUs?.teamSize;

  if (loading) return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2 animate-pulse">
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-64 mx-auto" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-48 mx-auto" />
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 p-6 md:p-8 animate-pulse">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-32 mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4/6" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            About {storeName}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            Your trusted partner since {foundingDate.split("-")[0] || "2020"}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Our Story</h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{story}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Our Mission</h3>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{mission}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Our Vision</h3>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{vision}</p>
          </div>
        </div>

        {achievements.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Achievements</h2>
            </div>
            <ul className="space-y-2">
              {achievements.map((a, i) => (
                <li key={i} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 text-zinc-400 text-sm py-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Established {new Date(foundingDate).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          {teamSize && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Team of {teamSize}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
