"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, User, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { collection, addDoc, Timestamp, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useContactInfo } from "@/hooks/useContactInfo";
import { ChatMessage, getAIResponse } from "@/lib/aiAgent";

export default function ContactPage() {
  const { contactInfo } = useContactInfo();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your shopping assistant. Tell me what you need help with, and I'll guide you through the steps.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Store chat if first user message
    if (!chatId) {
      try {
        const ref = await addDoc(collection(db, "aiChats"), {
          messages: [{ role: "user", content: text, createdAt: Timestamp.now() }],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        setChatId(ref.id);
      } catch {}
    } else {
      try {
        await updateDoc(doc(db, "aiChats", chatId), {
          messages: arrayUnion({ role: "user", content: text, createdAt: Timestamp.now() }),
          updatedAt: Timestamp.now(),
        });
      } catch {}
    }

    // Simulate AI processing delay
    setTimeout(async () => {
      const aiResponse = getAIResponse(text);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: aiResponse.response,
        steps: aiResponse.steps,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);

      // Show contact form if user asked for human support
      if (text.toLowerCase().includes("contact") || text.toLowerCase().includes("speak to") || text.toLowerCase().includes("human")) {
        setShowForm(true);
      }

      // Store AI response
      if (chatId) {
        try {
          await updateDoc(doc(db, "aiChats", chatId), {
            messages: arrayUnion({ role: "assistant", content: aiResponse.response, steps: aiResponse.steps, createdAt: Timestamp.now() }),
            updatedAt: Timestamp.now(),
          });
        } catch {}
      }
    }, 800);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
      return toast.error("Please fill in all required fields.");
    }
    setFormSubmitting(true);
    try {
      await addDoc(collection(db, "queries"), {
        name: formName, email: formEmail, subject: formSubject || "General Inquiry", message: formMessage,
        createdAt: new Date(), status: "Unread",
      });
      await addDoc(collection(db, "contacts"), {
        name: formName, email: formEmail, message: formMessage, createdAt: new Date(), read: false,
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
            {contactInfo.storeName} Help Center
          </h1>
          <p className="text-xs text-zinc-400 font-medium max-w-lg mx-auto">
            Ask our AI assistant anything — it will guide you step by step. Need a human? Just ask!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact info sidebar */}
          <div className="space-y-4 lg:col-span-1 order-2 lg:order-1">
            <a
              href={`tel:${contactInfo.phone.replace(/\s+/g, "")}`}
              className="block bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 p-5 rounded-2xl flex items-start gap-4 shadow-xs hover:border-emerald-500 transition-colors"
            >
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Call Helpdesk</h3>
                <p className="text-sm font-bold text-zinc-850 dark:text-zinc-200 hover:text-emerald-600 transition-colors">{contactInfo.phone}</p>
                <span className="text-[10px] text-zinc-400 font-medium block">9:00 AM - 9:00 PM</span>
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
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Email Us</h3>
                <p className="text-sm font-bold text-zinc-850 dark:text-zinc-200 hover:text-teal-600 transition-colors">{contactInfo.email}</p>
                <span className="text-[10px] text-zinc-400 font-medium block">Average response time: 4 hours</span>
              </div>
            </a>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 p-5 rounded-2xl flex items-start gap-4 shadow-xs">
              <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-500 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Corporate Office</h3>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {contactInfo.address}
                </p>
              </div>
            </div>
          </div>

          {/* AI Chat + Contact Form */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">
            {/* AI Chat Interface */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-3xl shadow-xs overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">AI Assistant</p>
                  <p className="text-[10px] text-white/70">Online — Ask me anything</p>
                </div>
              </div>

              <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === "user" ? "bg-blue-100 dark:bg-blue-900" : "bg-emerald-100 dark:bg-emerald-900"
                    }`}>
                      {msg.role === "user" ? (
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                      ) : (
                        <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                      )}
                    </div>
                    <div className={`max-w-[80%] space-y-2 ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}>
                      <div className={`rounded-2xl px-4 py-2.5 ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white rounded-tr-md"
                          : "bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-tl-md"
                      }`}>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.steps && msg.steps.length > 0 && msg.role === "assistant" && (
                        <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-3 space-y-1.5 ml-2">
                          <p className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Follow these steps:
                          </p>
                          {msg.steps.map((step, si) => (
                            <p key={si} className="text-[11px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                              {step.startsWith("**") ? (
                                <span className="font-bold text-emerald-700 dark:text-emerald-300">{step.replace(/\*\*/g, "")}</span>
                              ) : (
                                <>{si + 1}. {step}</>
                              )}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl rounded-tl-md px-4 py-2.5">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800 p-3">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your issue..."
                    className="flex-1 px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition shrink-0"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Form (shown when AI can't help or user asks for human) */}
            {showForm && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
