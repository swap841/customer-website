import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(self)" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://js.stripe.com https://www.googletagmanager.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://images.unsplash.com https://i.ibb.co https://lh3.googleusercontent.com https://images.pexels.com",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://*.render.com wss://*.firebaseio.com https://www.googleapis.com",
      "frame-src 'self' https://checkout.razorpay.com https://js.stripe.com https://www.google.com/recaptcha/",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "**" },
      { protocol: "https", hostname: "i.ibb.co", pathname: "**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "**" },
      { protocol: "https", hostname: "images.pexels.com", pathname: "**" },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
