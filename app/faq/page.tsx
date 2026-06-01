"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MessageCircle, ChevronDown, ChevronUp, Bot, Send, User, Loader2 } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { getAIResponse, getGeminiResponse, setGeminiApiKey, ChatMessage } from "@/lib/aiAgent";
import { useAppConfig } from "@/hooks/useAppConfig";
import { useContactInfo } from "@/hooks/useContactInfo";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { data: appConfig } = useAppConfig();
  const { contactInfo } = useContactInfo();

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "chatbotFAQ"));
      const items: FaqItem[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FaqItem));
      setFaqs(items);
    })();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (appConfig?.ai?.geminiApiKey) {
      setGeminiApiKey(appConfig.ai.geminiApiKey);
    }
  }, [appConfig]);

  const filtered = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async () => {
    const q = input.trim();
    if (!q) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setInput("");
    setTyping(true);

    let response;
    if (appConfig?.ai?.geminiApiKey) {
      const ctx = {
        storeName: appConfig?.branding?.storeName || contactInfo?.storeName,
        storeAddress: appConfig?.contact?.address || contactInfo?.address,
        contactPhone: appConfig?.contact?.phone || contactInfo?.phone,
        contactEmail: appConfig?.contact?.email || contactInfo?.email,
        faqEntries: faqs.map(f => ({ question: f.question, answer: f.answer })),
      };
      const convHistory = messages.map(m => ({ role: m.role, content: m.text }));
      response = await getGeminiResponse(q, ctx, convHistory);
    }
    if (!response) {
      response = getAIResponse(q);
    }

    setMessages((prev) => [...prev, { role: "assistant", text: response.response + (response.steps?.length ? "\n\n" + response.steps.map((s: string) => "• " + s).join("\n") : "") }]);
    setTyping(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 text-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6 lg:px-8 pt-28 sm:pt-32">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">
              {chatMode ? "Chat with us" : "FAQ"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {chatMode
                ? "Powered by AI — ask me anything about our store"
                : "Frequently asked questions"}
            </p>
          </div>
          <button
            onClick={() => {
              setChatMode((c) => !c);
              setMessages([]);
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 transition"
          >
            {chatMode ? (
              <>
                <MessageCircle size={18} /> View FAQ
              </>
            ) : (
              <>
                <Bot size={18} /> AI Chat
              </>
            )}
          </button>
        </div>

        {!chatMode ? (
          <>
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-[20px] border border-emerald-100 bg-white py-4 pl-12 pr-4 text-sm shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>

            <div className="space-y-3">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">No FAQs found</p>
              ) : (
                filtered.map((faq) => {
                  const isOpen = openId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="rounded-[18px] border border-emerald-100 bg-white shadow-sm overflow-hidden transition hover:shadow-md"
                    >
                      <button
                        onClick={() => setOpenId(isOpen ? null : faq.id)}
                        className="flex w-full items-center justify-between px-6 py-5 text-left text-sm font-semibold text-gray-900 hover:bg-emerald-50/50 transition"
                      >
                        <span>{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp size={18} className="shrink-0 text-emerald-600" />
                        ) : (
                          <ChevronDown size={18} className="shrink-0 text-emerald-600" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 text-sm leading-7 text-gray-600 border-t border-emerald-50 pt-4">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="rounded-[20px] border border-emerald-100 bg-white shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Bot size={18} className="text-emerald-700" />
                  </div>
                  <div className="max-w-[80%] rounded-[18px] rounded-tl-sm bg-emerald-50 px-4 py-3 text-sm text-gray-700">
                    Hi! I'm your AI assistant. Ask me about orders, delivery, products, or anything about our store!
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  {m.role === "bot" || m.role === "assistant" ? (
                    <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Bot size={18} className="text-emerald-700" />
                    </div>
                  ) : (
                    <div className="shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={18} className="text-blue-600" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-[18px] px-4 py-3 text-sm leading-6 whitespace-pre-line ${
                    m.role === "user" ? "rounded-tr-sm bg-emerald-600 text-white" : "rounded-tl-sm bg-gray-100 text-gray-700"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Bot size={18} className="text-emerald-700" />
                  </div>
                  <div className="rounded-[18px] rounded-tl-sm bg-gray-100 px-5 py-4 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-emerald-100 p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 rounded-[20px] border border-emerald-100 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || typing}
                  className="shrink-0 rounded-full bg-emerald-600 p-3 text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {typing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
