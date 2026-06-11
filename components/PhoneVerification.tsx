"use client";
import { useState, useEffect, useCallback } from "react";
import { Phone, Mail, CheckCircle2, Loader2, AlertCircle, XCircle } from "lucide-react";
import { getAuth } from "firebase/auth";
import { validateIndianPhoneNumber } from "@/utils/phoneValidation";
import { toast } from "sonner";

interface Props {
  userEmail: string;
  onVerified: (phone: string) => void;
  initialPhone?: string;
}

export default function PhoneVerification({ userEmail, onVerified, initialPhone }: Props) {
  const [phone, setPhone] = useState(initialPhone || "");
  const [phoneValid, setPhoneValid] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  useEffect(() => {
    if (!phone) {
      setPhoneValid(false);
      setPhoneError("");
      return;
    }
    const result = validateIndianPhoneNumber(phone);
    setPhoneValid(result.isValid);
    setPhoneError(result.error);
  }, [phone]);

  useEffect(() => {
    if (countdown <= 0) { setResendDisabled(false); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSendOtp = useCallback(async () => {
    if (!phoneValid || sending) return;
    setSending(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-u2qq.onrender.com"}/api/send-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ email: userEmail, phone: `+91${phone}` }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setCountdown(30);
        setResendDisabled(true);
        toast.success("Verification code sent to your email. Check your inbox.");
      } else {
        toast.error(data.error || "Failed to send OTP. Please try again.");
      }
    } catch {
      toast.error("Network error. Could not send verification code.");
    } finally {
      setSending(false);
    }
  }, [phone, phoneValid, sending, userEmail]);

  const handleVerifyOtp = useCallback(async () => {
    if (!otp || otp.length < 4 || verifying) return;
    setVerifying(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || "https://grocery-server-u2qq.onrender.com"}/api/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ email: userEmail, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpVerified(true);
        toast.success("Phone number verified successfully");
        onVerified(`+91${phone}`);
      } else {
        toast.error(data.error || "Invalid verification code.");
      }
    } catch {
      toast.error("Network error. Could not verify code.");
    } finally {
      setVerifying(false);
    }
  }, [otp, verifying, userEmail, phone, onVerified]);

  if (otpVerified) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Phone Verified</p>
          <p className="text-xs text-emerald-600">+91{phone}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
        <Phone className="w-4 h-4 text-emerald-600" /> Phone Verification
      </h3>

      <div className="flex items-center gap-2">
        <span className="text-gray-500 text-sm font-medium shrink-0">+91</span>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={e => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 10);
            setPhone(v);
            setOtpSent(false);
            setOtp("");
          }}
          placeholder="Enter 10-digit mobile number"
          className={`flex-1 px-3 py-2 border rounded-lg text-sm outline-none transition ${
            phoneError && phone ? "border-red-300 focus:border-red-500" :
            phoneValid ? "border-emerald-300 focus:border-emerald-500" :
            "border-gray-300 focus:border-emerald-500"
          }`}
          disabled={otpSent}
        />
        {phone && phoneValid && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
        {phone && phoneError && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
      </div>
      {phoneError && phone && (
        <p className="text-xs text-red-500 mt-1">{phoneError}</p>
      )}
      {!phone && (
        <p className="text-xs text-gray-400 mt-1">A verification code will be sent to your email</p>
      )}

      {!otpSent ? (
        <button
          onClick={handleSendOtp}
          disabled={!phoneValid || sending}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          {sending ? "Sending..." : "Send Verification Code"}
        </button>
      ) : (
        <div className="mt-3 space-y-3">
          <div>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit code from email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-emerald-500 text-center tracking-[0.3em] font-bold"
              maxLength={6}
            />
          </div>
          <button
            onClick={handleVerifyOtp}
            disabled={otp.length < 4 || verifying}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {verifying ? "Verifying..." : "Verify Code"}
          </button>
          <button
            onClick={handleSendOtp}
            disabled={resendDisabled || sending}
            className="w-full text-xs text-emerald-600 font-medium hover:underline disabled:text-gray-400 disabled:no-underline"
          >
            {resendDisabled ? `Resend in ${countdown}s` : "Resend Code"}
          </button>
        </div>
      )}
    </div>
  );
}
