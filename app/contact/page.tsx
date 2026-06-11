"use client";

import React, { useState, useRef } from "react";
import { Send, Loader2, Mail, Phone, MapPin, Bot, User } from "lucide-react";
import { toast } from "sonner";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useContactInfo } from "@/hooks/useContactInfo";
import { useAppConfig } from "@/hooks/useAppConfig";
import { getAIResponse, getGeminiResponse, ChatMessage } from "@/lib/aiAgent";

export default function ContactPage() {
  const { contactInfo } = useContactInfo();
  const { data: appConfig } = useAppConfig();
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your shopping assistant. Tell me what you need help with, and I'll guide you step by step.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setInput("");
    setLoading(true);

    let response;
    if (appConfig?.ai?.geminiApiKey) {
      const ctx = {
        storeName: appConfig?.branding?.storeName || contactInfo?.storeName,
        storeAddress: appConfig?.contact?.address || contactInfo?.address,
        contactPhone: appConfig?.contact?.phone || contactInfo?.phone,
        contactEmail: appConfig?.contact?.email || contactInfo?.email,
        faqEntries: [],
      };
      response = await getGeminiResponse(q, ctx, messages);
    }
    if (!response) {
      response = getAIResponse(q);
    }
    setMessages((prev) => [...prev, { role: "assistant", content: response.response, steps: response.steps }]);
    setLoading(false);
    if (q.toLowerCase().includes("human") || q.toLowerCase().includes("agent") || q.toLowerCase().includes("talk to")) {
      setShowForm(true);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
      return toast.error("Please fill in all required fields.");
    }
    setFormSubmitting(true);
    try {
      await addDoc(collection(db, "contacts"), {
        name: formName, email: formEmail, message: formMessage, createdAt: new Date(), read: false,
      });
      await addDoc(collection(db, "queries"), {
        name: formName, email: formEmail, subject: formSubject || "General Inquiry", message: formMessage,
        createdAt: new Date(), status: "Unread",
      });
      toast.success("Message sent successfully! We'll get back to you within 24 hours.");
      setFormName(""); setFormEmail(""); setFormSubject(""); setFormMessage("");
      setShowForm(false);
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            {contactInfo.storeName} {contactInfo.contactHelpcenterTitle || "Help Center"}
          </h1>
          <p className="text-xs text-zinc-400 font-medium max-w-lg mx-auto">
            Ask our AI assistant anything — it will guide you step by step. Need a human? Just ask!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact info cards */}
          <div className="space-y-4">
            <a
              href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`}
              className="block bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 p-5 rounded-2xl flex items-start gap-4 shadow-xs hover:border-emerald-500 transition-colors"
            >
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">{contactInfo.contactCallHelpdeskTitle || "Call Helpdesk"}</h3>
                <p className="text-sm font-bold text-zinc-850 dark:text-zinc-200 hover:text-emerald-600 transition-colors">{contactInfo.phone}</p>
                <span className="text-[10px] text-zinc-400 font-medium block">{contactInfo.workingHours || "9:00 AM - 9:00 PM"}</span>
              </div>
            </a>

            <a
              href={`mailto:${contactInfo.email}`}
              className="block bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 p-5 rounded-2xl flex items-start gap-4 shadow-xs hover:border-teal-500 transition-colors"
            >
              <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-500 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">{contactInfo.contactEmailUsTitle || "Email Us"}</h3>
                <p className="text-sm font-bold text-zinc-850 dark:text-zinc-200 hover:text-teal-600 transition-colors">{contactInfo.email}</p>
                <span className="text-[10px] text-zinc-400 font-medium block">{contactInfo.responseTime || "Average response time: 4 hours"}</span>
              </div>
            </a>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactInfo.address || "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 p-5 rounded-2xl flex items-start gap-4 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
            >
              <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-500 shrink-0 group-hover:bg-violet-500/20 transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">{contactInfo.contactAddressTitle || "Our Location"}</h3>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {contactInfo.address}
                </p>
              </div>
            </a>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 p-6 rounded-3xl shadow-xs space-y-4">
            <h2 className="font-bold text-sm flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-emerald-500" />
              Send us a message
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Name *</label>
                  <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} required
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold rounded-xl focus:outline-none" placeholder="Your name" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Email *</label>
                  <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold rounded-xl focus:outline-none" placeholder="Your email" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Subject</label>
                <input type="text" value={formSubject} onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold rounded-xl focus:outline-none" placeholder="Subject" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Message *</label>
                <textarea value={formMessage} onChange={(e) => setFormMessage(e.target.value)} required rows={3}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium rounded-xl focus:outline-none resize-none" placeholder="Describe your query..." />
              </div>
              <button type="submit" disabled={formSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10 transition disabled:opacity-50">
                {formSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</> : <><Send className="w-3.5 h-3.5" /> Submit</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
