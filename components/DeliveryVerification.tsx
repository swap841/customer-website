"use client";
import { useState } from "react";
import { ShieldCheck, CheckCircle2, Loader2, Send } from "lucide-react";
import { getAuth } from "firebase/auth";
import { toast } from "sonner";

interface Props {
  orderId: string;
  userEmail: string;
  onVerified: () => void;
}

export default function DeliveryVerification({ orderId, userEmail, onVerified }: Props) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const handleSendOtp = async () => {
    setSending(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-u2qq.onrender.com"}/api/send-delivery-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ orderId, email: userEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setSentTo(userEmail);
        toast.success("Delivery verification code sent to your email.");
      } else {
        toast.error(data.error || "Failed to send verification code.");
      }
    } catch {
      toast.error("Network error. Could not send code.");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length < 4 || verifying) return;
    setVerifying(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-u2qq.onrender.com"}/api/verify-delivery-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ orderId, otp }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Delivery confirmed! Thank you.");
        onVerified();
      } else {
        toast.error(data.error || "Invalid verification code.");
      }
    } catch {
      toast.error("Network error. Could not verify code.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-gray-900">Delivery Verification</h3>
          <p className="text-xs text-gray-500">Confirm delivery to complete this order</p>
        </div>
      </div>

      {!otpSent ? (
        <button
          onClick={handleSendOtp}
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? "Sending..." : "Send Verification Code to Email"}
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">A code was sent to <strong>{sentTo}</strong>. Enter it below to confirm delivery.</p>
          <input
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter code"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-purple-500 text-center tracking-[0.3em] font-bold"
            maxLength={6}
          />
          <button
            onClick={handleVerify}
            disabled={otp.length < 4 || verifying}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition disabled:opacity-50"
          >
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {verifying ? "Verifying..." : "Confirm Delivery"}
          </button>
        </div>
      )}
    </div>
  );
}
