"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithCustomToken,
} from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { requestFcmToken } from "@/lib/firebaseMessaging";
import { toast } from "sonner";
import { Loader2, Phone } from "lucide-react";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-u2qq.onrender.com";

function isValidIndianPhone(num: string): boolean {
  if (num.length !== 10) return false;
  if (!/^\d{10}$/.test(num)) return false;
  if (!/^[6-9]/.test(num)) return false;
  if (/^(\d)\1{9}$/.test(num)) return false;
  if (num === "0000000000") return false;
  return true;
}

export default function AuthPage() {
  const router = useRouter();
  const [showOtpLogin, setShowOtpLogin] = useState(false);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [phoneForOtp, setPhoneForOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) router.push("/");
    });
    return () => unsub();
  }, [auth, router]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handlePhoneSubmit = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (!isValidIndianPhone(cleaned)) {
      toast.error("Enter a valid Indian mobile number (starts with 6-9, 10 digits)");
      return;
    }
    const full = `+91${cleaned}`;
    setVerifying(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/send-phone-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: full }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.error || "Failed to send OTP"); return; }
      setPhoneForOtp(full);
      setStep("otp");
      setCountdown(30);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      if (data.simulated) toast.info("SMS gateway not configured. Check server logs for OTP.");
      else toast.success("OTP sent to " + cleaned.slice(0, 2) + "XXXX" + cleaned.slice(-2));
    } catch {
      toast.error("Could not connect to server. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setOtp(["", "", "", "", "", ""]);
    setResending(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/send-phone-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneForOtp }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.error || "Failed to resend OTP"); return; }
      setCountdown(30);
      toast.success("OTP resent");
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const handleOtpSubmit = async () => {
    const code = otp.join("");
    if (code.length !== 6) { toast.error("Enter all 6 digits of the OTP"); return; }
    setVerifying(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/verify-phone-otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneForOtp, otp: code }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.error || "Verification failed"); return; }
      if (data.linked && data.customToken) {
        await signInWithCustomToken(auth, data.customToken);
        toast.success("Signed in successfully");
        router.push("/");
      } else {
        toast.error("Phone not linked. Use Google Sign-In to create an account.");
      }
    } catch {
      toast.error("Verification failed. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider());
      toast.success("Signed in with Google");
      // Request notification permission and register FCM token
      try {
        await requestFcmToken(cred.user.uid);
      } catch {}
      router.push("/");
    } catch (err: unknown) {
      const e = err as { code?: string };
      if (e.code !== "auth/popup-closed-by-user") {
        toast.error("Google sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const otpInputClass = "w-11 h-12 text-center text-lg font-bold rounded-xl border bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white";

  const handleOtpChange = (i: number, val: string) => {
    if (val && !/^\d$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = [...otp];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    for (let i = text.length; i < 6; i++) next[i] = "";
    setOtp(next);
    const focusIdx = Math.min(text.length, 5);
    otpRefs.current[focusIdx]?.focus();
  };

  if (showOtpLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto shadow-md">
                <span className="text-white text-xl font-black">M</span>
              </div>
              {step === "phone" && (
                <>
                  <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Sign in with OTP</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Enter your phone number to receive an OTP</p>
                </>
              )}
              {step === "otp" && (
                <>
                  <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Enter OTP</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Sent to <span className="font-semibold text-gray-700 dark:text-gray-300">{phoneForOtp.replace("+91", "")}</span>
                  </p>
                </>
              )}
            </div>

            {step === "phone" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <div className="flex items-center rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500">
                    <span className="px-3 text-gray-500 dark:text-gray-400 font-semibold text-sm border-r border-gray-300 dark:border-gray-600 py-3 bg-gray-100 dark:bg-gray-600">+91</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      onKeyDown={(e) => e.key === "Enter" && handlePhoneSubmit()}
                      placeholder="9876543210"
                      className="flex-1 bg-transparent px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none"
                      autoFocus
                    />
                  </div>
                  {phone.length === 10 && !isValidIndianPhone(phone) && (
                    <p className="text-xs text-red-500 mt-1">Enter a valid Indian mobile number (starts with 6-9)</p>
                  )}
                </div>
                <button
                  onClick={handlePhoneSubmit}
                  disabled={verifying || phone.length !== 10}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {verifying && <Loader2 className="w-5 h-5 animate-spin" />}
                  {verifying ? "Sending OTP..." : <><Phone className="w-4 h-4" /> Send OTP</>}
                </button>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-5">
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={otpInputClass}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                <button
                  onClick={handleOtpSubmit}
                  disabled={verifying || otp.join("").length !== 6}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {verifying && <Loader2 className="w-5 h-5 animate-spin" />}
                  {verifying ? "Verifying..." : "Verify OTP"}
                </button>
                <div className="flex items-center justify-between text-sm">
                  <button
                    onClick={() => { setStep("phone"); setPhone(""); }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium"
                  >
                    Change number
                  </button>
                  <button
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || resending}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {resending ? "Resending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => { setShowOtpLogin(false); setStep("phone"); setPhone(""); }}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium"
              >
                Back to Google sign-in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto shadow-md">
              <span className="text-white text-xl font-black">M</span>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Welcome</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in with your Google account</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
            </div>

            <button
              onClick={() => setShowOtpLogin(true)}
              className="w-full text-center text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium py-2"
            >
              Sign in with OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
