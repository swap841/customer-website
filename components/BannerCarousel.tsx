"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface BannerData {
  id: string;
  imageUrl: string;
  link?: string;
}

export default function BannerCarousel({ banners }: { banners: BannerData[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % banners.length), 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="w-full relative aspect-[4/3] rounded-[20px] overflow-hidden shadow-xl shadow-emerald-500/10 border border-emerald-100/60 group">
      <a href={banners[currentSlide].link || "/products"}>
        <Image
          src={banners[currentSlide].imageUrl}
          alt="Store Banner"
          fill
          sizes="100vw"
          className="object-cover transition-all duration-700 hover:scale-105"
          priority
        />
      </a>

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSlide ? "bg-white w-5" : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
