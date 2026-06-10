"use client";

import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Smartphone, KeyRound, MessageSquare } from "lucide-react";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-u2qq.onrender.com";

interface PhoneVerificationProps {
  userId: string;
  initialPhone?: string;
  onVerified: (phone: string) => void;
  onPhoneChange?: (phone: string) => void;
}

export default function PhoneVerification({ userId, initialPhone = "", onVerified, onPhoneChange }: PhoneVerificationProps) {
  const [phone, setPhone] = useState(initialPhone.replace(/\D/g, "").slice(0, 10));
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "verified">("phone");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [fcmFailed, setFcmFailed] = useState(false);
  const [otpChannel, setOtpChannel] = useState<"fcm" | "sms" | "">("");

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  async function handleSendOtp() {
    const clean = phone.replace(/\D/g, "");
    if (clean.length !== 10) { toast.error("Enter a valid 10-digit phone number"); return; }
    if (!/^[6-9]/.test(clean)) { toast.error("Phone must start with 6-9"); return; }
    setSending(true);
    setFcmFailed(false);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) { toast.error("Please login first"); return; }
      const res = await fetch(`${SERVER_URL}/api/auth/send-otp-fcm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, phoneNumber: phone }),
      });
      const data = await res.json();
      if (!data.success) {
        // If FCM failed, show SMS fallback option
        if (data.error?.includes("notification") || data.error?.includes("FCM")) {
          setFcmFailed(true);
          toast.error("Push notification failed. Use SMS fallback below.");
        } else {
          toast.error(data.error || "Failed to send OTP");
        }
        return;
      }
      setOtpChannel(data.channel || "fcm");
      toast.success(data.channel === "fcm" ? "OTP sent via notification" : "OTP sent via SMS");
      setStep("otp");
      setCountdown(120);
      onPhoneChange?.(phone);
    } catch {
      toast.error("Network error. Check your connection.");
    } finally {
      setSending(false);
    }
  }

  async function handleSendSmsFallback() {
    setSending(true);
    try {
      const cleaned = phone.replace(/\D/g, "");
      const full = `+91${cleaned}`;
      const res = await fetch(`${SERVER_URL}/api/auth/send-phone-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: full }),
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.error || "Failed to send SMS"); return; }
      setOtpChannel("sms");
      setFcmFailed(false);
      toast.success("OTP sent via SMS");
      setStep("otp");
      setCountdown(30);
      onPhoneChange?.(phone);
    } catch {
      toast.error("SMS failed. Check your connection.");
    } finally {
      setSending(false);
    }
  }

  async function handleVerify() {
    if (otp.length !== 6) { toast.error("Enter the 6-digit OTP"); return; }
    setVerifying(true);
    try {
      if (otpChannel === "sms") {
        // Verify via SMS endpoint
        const cleaned = phone.replace(/\D/g, "");
        const full = `+91${cleaned}`;
        const res = await fetch(`${SERVER_URL}/api/auth/verify-phone-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: full, otp }),
        });
        const data = await res.json();
        if (!data.success) { toast.error(data.error || "Invalid OTP"); return; }
        if (data.linked && data.customToken) {
          const { signInWithCustomToken } = await import("firebase/auth");
          await signInWithCustomToken(getAuth(), data.customToken);
          toast.success("Phone verified successfully");
          setStep("verified");
          onVerified(phone);
        } else {
          // Phone not linked, link it to current Google account
          const user = getAuth().currentUser;
          if (user) {
            const linkRes = await fetch(`${SERVER_URL}/api/auth/link-phone-to-google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phoneNumber: full, googleUid: user.uid, googleEmail: user.email || "" }),
            });
            const linkData = await linkRes.json();
            if (linkData.success) {
              toast.success("Phone verified and linked to your account");
              setStep("verified");
              onVerified(phone);
            } else {
              toast.error("Failed to link phone to account");
            }
          }
        }
      } else {
        // Verify via FCM endpoint
        const token = await getAuth().currentUser?.getIdToken();
        if (!token) { toast.error("Please login first"); return; }
        const res = await fetch(`${SERVER_URL}/api/auth/verify-phone-fcm`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId, phoneNumber: phone, otp }),
        });
        const data = await res.json();
        if (!data.success) { toast.error(data.error || "Invalid OTP"); return; }
        setStep("verified");
        toast.success("Phone verified successfully");
        onVerified(phone);
      }
    } catch {
      toast.error("Network error. Check your connection.");
    } finally {
      setVerifying(false);
    }
  }

  function handleResend() {
    setOtp("");
    handleSendOtp();
  }

  if (step === "verified") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2 text-emerald-700">
        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium">Phone verified: <span className="font-bold">+91 {phone}</span></span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 p-3 bg-gray-50/50">
      {step === "phone" ? (
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            <Smartphone className="w-3.5 h-3.5 inline mr-1" />Phone Number
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-transparent outline-none text-gray-800 text-sm"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              type="tel"
              inputMode="numeric"
              required
            />
            <button
              onClick={handleSendOtp}
              disabled={sending || phone.length !== 10 || !/^[6-9]/.test(phone)}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition whitespace-nowrap"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : "Send OTP"}
            </button>
          </div>
          {fcmFailed && (
            <button
              onClick={handleSendSmsFallback}
              disabled={sending}
              className="mt-2 w-full flex items-center justify-center gap-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium py-1.5 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Send OTP via SMS instead
            </button>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            <KeyRound className="w-3.5 h-3.5 inline mr-1" />
            Enter OTP sent via {otpChannel === "fcm" ? "notification" : "SMS"} to +91 {phone}
          </label>
          <div className="flex gap-2 items-center">
            <input
              className="flex-1 bg-transparent outline-none text-gray-800 text-sm font-mono tracking-widest"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              type="text"
              inputMode="numeric"
              autoFocus
            />
            <button
              onClick={handleVerify}
              disabled={verifying || otp.length !== 6}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {verifying ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : "Verify"}
            </button>
          </div>
          <div className="flex items-center gap-3 mt-2">
            {countdown > 0 ? (
              <span className="text-xs text-gray-400">Resend in {countdown}s</span>
            ) : (
              <button onClick={handleResend} disabled={sending} className="text-xs text-emerald-600 hover:underline font-medium">
                Resend OTP
              </button>
            )}
            <button onClick={() => { setStep("phone"); setOtp(""); setFcmFailed(false); }} className="text-xs text-gray-400 hover:underline">
              Change number
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
