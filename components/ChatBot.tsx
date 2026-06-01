"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bot, X, Send, MessageCircle, Loader2, User } from "lucide-react";
import { collection, addDoc, Timestamp, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebaseClient";
import { getAIResponse, getGeminiResponse, setGeminiApiKey } from "@/lib/aiAgent";
import { useAppConfig } from "@/hooks/useAppConfig";
import { useContactInfo } from "@/hooks/useContactInfo";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hi! 👋 I'm your shopping assistant. Ask me anything about orders, delivery, products, or just say hi!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: appConfig } = useAppConfig();
  const { contactInfo } = useContactInfo();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (appConfig?.ai?.geminiApiKey) {
      setGeminiApiKey(appConfig.ai.geminiApiKey);
    }
  }, [appConfig]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const auth = getAuth();
    const user = auth.currentUser;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    if (user && !chatId) {
      try {
        const ref = await addDoc(collection(db, "aiChats"), {
          messages: [{ role: "user", content: text, createdAt: Timestamp.now() }],
          userId: user.uid,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        setChatId(ref.id);
      } catch {}
    } else if (user && chatId) {
      try {
        await updateDoc(doc(db, "aiChats", chatId), {
          messages: arrayUnion({ role: "user", content: text, createdAt: Timestamp.now() }),
          updatedAt: Timestamp.now(),
        });
      } catch {}
    }

    setTimeout(async () => {
      let response;
      if (appConfig?.ai?.geminiApiKey) {
        const ctx = {
          storeName: appConfig?.branding?.storeName || contactInfo?.storeName,
          storeAddress: appConfig?.contact?.address || contactInfo?.address,
          contactPhone: appConfig?.contact?.phone || contactInfo?.phone,
          contactEmail: appConfig?.contact?.email || contactInfo?.email,
          deliveryRadius: contactInfo?.deliveryRadiusKm || 20,
          minOrderValue: appConfig?.store?.minOrderValue || 49,
          deliveryCharge: appConfig?.store?.deliveryCharge || 29,
          freeDeliveryAbove: appConfig?.store?.freeDeliveryAbove || 299,
          faqEntries: [],
        };
        response = await getGeminiResponse(text, ctx, messages);
      }
      if (!response) {
        response = getAIResponse(text);
      }
      setMessages((prev) => [...prev, { role: "assistant", content: response.response + (response.steps?.length ? "\n\n" + response.steps.map((s: string) => "• " + s).join("\n") : "") }]);
      setLoading(false);

      if (chatId) {
        try {
          await updateDoc(doc(db, "aiChats", chatId), {
            messages: arrayUnion({ role: "assistant", content: response.response, createdAt: Timestamp.now() }),
            updatedAt: Timestamp.now(),
          });
        } catch {}
      }
    }, 800);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-white" />
              <span className="text-sm font-bold text-white">AI Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 items-start ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === "user" ? "bg-blue-100" : "bg-emerald-100"
                }`}>
                  {m.role === "user" ? <User className="w-3.5 h-3.5 text-blue-600" /> : <Bot className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                  m.role === "user" ? "bg-emerald-600 text-white rounded-tr-sm" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-tl-sm"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-start">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-800 p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="shrink-0 w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
