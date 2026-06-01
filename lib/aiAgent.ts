export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  steps?: string[];
}

const greetings = ["hi", "hello", "hey", "help", "start", "good morning", "good evening", "good afternoon", "hii", "hlo", "hy", "helloo"];

interface Pattern {
  keywords: string[];
  partials?: string[];
  response: string;
  steps: string[];
}

const patterns: Pattern[] = [
  {
    keywords: ["defective", "damaged", "broken", "not working", "faulty", "malfunction", "cracked", "torn", "spoiled", "rotten", "expired"],
    partials: ["bad quality", "poor quality", "quality issue"],
    response: "I'm sorry to hear your item arrived defective! Here's how to report it:",
    steps: [
      "Go to your **Profile** page",
      "Scroll to **Past Orders**",
      "Find the order with the defective item",
      "Tap the **⋮ (three dots)** button on that order",
      "Select **Defective / Damaged Item**",
      "The support team will review and get back to you within 24 hours",
    ],
  },
  {
    keywords: ["missing", "didn't receive", "not delivered", "shortage", "incomplete", "short", "less", "fewer"],
    partials: ["did not receive", "haven't received", "didnt get", "not get", "didn't get", "item missing"],
    response: "I understand some items were missing from your delivery. Here's how to report it:",
    steps: [
      "Go to your **Profile** page",
      "Scroll to **Past Orders**",
      "Find the affected order",
      "Tap the **⋮ (three dots)** button",
      "Select **Missing Item**",
      "We'll arrange a free replacement or refund for the missing items",
    ],
  },
  {
    keywords: ["wrong", "incorrect", "not what i ordered", "different item", "not my order", "mistake", "mixed up", "swapped"],
    partials: ["not what i ordered", "received wrong", "got wrong", "wrong item", "wrong product"],
    response: "It looks like you received the wrong item. Let's fix that:",
    steps: [
      "Go to your **Profile** page",
      "Scroll to **Past Orders**",
      "Find the order with the wrong item",
      "Tap the **⋮ (three dots)** button",
      "Select **Wrong Order**",
      "We'll send the correct item and arrange a pickup for the wrong one",
    ],
  },
  {
    keywords: ["return", "refund", "money back", "cancel order", "refund request", "cancellation"],
    partials: ["want refund", "need refund", "get refund", "my money", "give me refund"],
    response: "For returns and refunds, here's what to do:",
    steps: [
      "Go to your **Profile** page",
      "Click on the **Delivered** order you want to return",
      "Scroll down to **Request Return**",
      "Enter the reason and submit",
      "Our team will process your refund within 5-7 business days",
    ],
  },
  {
    keywords: ["track", "where is my order", "delivery status", "shipping", "order status", "order progress", "my order"],
    partials: ["where is", "what is the status", "current status", "order update", "any update", "how long"],
    response: "To track your order in real-time:",
    steps: [
      "Go to your **Profile** page",
      "Look under **Current Orders**",
      "Click on any order to see its **live status**",
      "You'll see the progress: Pending → Packing → Out for Delivery → Delivered",
      "If assigned for delivery, you can see their real-time location",
    ],
  },
  {
    keywords: ["delayed", "late", "not yet arrived", "running late", "overdue", "behind schedule", "taking too long", "delayed delivery"],
    partials: ["not arrived", "hasn't arrived", "has not arrived", "taking long", "very late", "still not here"],
    response: "I'm sorry your order is delayed! I understand this can be frustrating. Here's what you can do:",
    steps: [
      "Go to your **Profile** page to check the current status",
      "If the order is **Out for Delivery**, it should arrive soon",
      "If it's still **Packing** or **Pending**, there may be a backlog",
      "You can also **Contact Support** below and we'll investigate",
      "We'll do our best to get your order to you as quickly as possible!",
    ],
  },
  {
    keywords: ["reorder", "order again", "repeat", "same order", "again", "repurchase", "buy again", "previous order"],
    partials: ["want to order again", "place same order", "re order"],
    response: "Want to order the same items again? Easy:",
    steps: [
      "Go to your **Profile** page",
      "Scroll to **Past Orders**",
      "Find the order you want to repeat",
      "Click the **Reorder** button",
      "A new order with the same items will be placed",
    ],
  },
  {
    keywords: ["update address", "change address", "edit profile", "phone number", "change number", "update phone", "update number"],
    partials: ["change my address", "new address", "change my number", "update my profile"],
    response: "To update your profile details:",
    steps: [
      "Go to your **Profile** page",
      "Edit your **Name**, **Phone**, or **Address** in the form",
      "Click **Save Profile** to confirm changes",
    ],
  },
  {
    keywords: ["payment", "paid", "charge", "razorpay", "failed payment", "payment failed", "payment issue", "payment problem", "debit", "credit card"],
    partials: ["transaction failed", "could not pay", "payment error", "pay failed"],
    response: "For payment-related queries:",
    steps: [
      "Check your order status on the **Profile** page",
      "If payment failed, you can retry from the **Cart** page",
      "For refunds, raise a return request from the order page",
      "Contact our support team below if you need further help",
    ],
  },
  {
    keywords: ["contact", "speak to", "agent", "human", "support", "talk to", "representative", "customer care", "help"],
    partials: ["talk to someone", "speak to someone", "real person", "customer service"],
    response: "I'll connect you with our support team. Please fill in the form below and we'll get back to you within 24 hours.",
    steps: [
      "Fill in your name, email, and message in the form below",
      "Our team will respond to your email",
    ],
  },
  {
    keywords: ["coupon", "discount", "promo", "offer", "voucher", "promotion", "deal", "save", "cheaper"],
    partials: ["any discount", "coupon code", "promo code", "discount code"],
    response: "Looking for discounts? Here's how to use coupons:",
    steps: [
      "Browse our **Products** page and add items to your cart",
      "On the **Checkout** page, enter your coupon code in the coupon field",
      "Click **Apply** to see the discount",
      "Complete your purchase to enjoy the savings!",
    ],
  },
  {
    keywords: ["delivery charge", "shipping charge", "delivery fee", "free delivery", "delivery time", "how long delivery", "delivery slot", "time slot"],
    partials: ["how much delivery", "delivery cost", "shipping fee", "will it deliver"],
    response: "Here's what you need to know about delivery:",
    steps: [
      "We deliver within a **15 km radius** from our store",
      "**Free delivery** on orders above ₹299",
      "Standard delivery charge: **₹29**",
      "Delivery slots are shown during checkout",
      "Estimated delivery: **within 24 hours**",
    ],
  },
  {
    keywords: ["minimum order", "min order", "how much to order", "order minimum", "minimum amount"],
    partials: ["minimum for delivery", "what is the minimum"],
    response: "Our minimum order details:",
    steps: [
      "**Minimum order value**: ₹49",
      "**Free delivery**: Orders above ₹299",
      "Add more items to your cart to reach the minimum!",
    ],
  },
  {
    keywords: ["stock", "available", "in stock", "out of stock", "availability", "unavailable", "sold out", "when back"],
    partials: ["is it available", "do you have", "will you get", "coming back"],
    response: "Checking product availability:",
    steps: [
      "You can see stock levels on each **Product** page",
      "If an item is **out of stock**, we restock regularly",
      "Use the **Contact** form to ask about specific items",
      "We'll notify you when items are back in stock",
    ],
  },
  {
    keywords: ["complaint", "complaint", "issue", "problem", "not happy", "unsatisfied", "unhappy", "frustrated"],
    partials: ["i have a complaint", "i want to complain", "not satisfied", "very disappointed"],
    response: "I'm sorry you're not satisfied. Let us make it right:",
    steps: [
      "Please describe your issue in the **contact form** below",
      "Our support team will investigate within 24 hours",
      "You can also report issues via your **Order Detail** page",
      "We value your feedback and will work to resolve this quickly",
    ],
  },
  {
    keywords: ["timing", "time", "working hours", "store hours", "business hours", "open", "closed", "when open"],
    partials: ["what time", "till what time", "what are the hours"],
    response: "Our store timing and availability:",
    steps: [
      "We operate during **standard business hours**",
      "Delivery slots are shown during checkout",
      "Orders placed after cutoff will be delivered the next day",
      "Check the **Store Config** for exact hours set by the owner",
    ],
  },
];

function scoreMatch(input: string, pattern: Pattern): number {
  const lower = input.toLowerCase().trim();
  let score = 0;

  for (const kw of pattern.keywords) {
    if (lower.includes(kw)) {
      score += kw.length;
    }
  }

  if (pattern.partials) {
    for (const p of pattern.partials) {
      if (lower.includes(p)) {
        score += p.length * 1.5;
      }
    }
  }

  for (const kw of pattern.keywords) {
    const words = kw.split(" ");
    if (words.length > 1) {
      const allPresent = words.every(w => lower.includes(w));
      if (allPresent) score += kw.length * 2;
    }
  }

  return score;
}

function findBestMatch(input: string): { response: string; steps: string[] } | null {
  const lower = input.toLowerCase().trim();
  let best: Pattern | null = null;
  let bestScore = 0;

  for (const p of patterns) {
    const s = scoreMatch(lower, p);
    if (s > bestScore && s >= 2) {
      bestScore = s;
      best = p;
    }
  }

  if (best) {
    return { response: best.response, steps: best.steps };
  }

  for (const p of patterns) {
    for (const kw of p.keywords) {
      const kwWords = kw.split(" ");
      const inputWords = lower.split(/\s+/);
      let matches = 0;
      for (const iw of inputWords) {
        for (const kw of kwWords) {
          if (iw.length >= 3 && kw.length >= 3 && kw.includes(iw)) {
            matches++;
          }
        }
      }
      if (matches >= Math.min(kwWords.length, 2)) {
        return { response: p.response, steps: p.steps };
      }
    }
  }

  return null;
}

export function getAIResponse(input: string): { response: string; steps: string[] } {
  const lower = input.trim().toLowerCase();

  if (!lower || lower.length <= 2 || greetings.some(g => lower === g || lower.startsWith(g))) {
    return {
      response: "Hello! I'm your shopping assistant. I can help you with:",
      steps: [
        "**Defective items** — Report a damaged or faulty product",
        "**Missing items** — Report items not received",
        "**Wrong order** — Report incorrect items",
        "**Delayed delivery** — Check on a late order",
        "**Returns & Refunds** — Request a return or refund",
        "**Track order** — Check your delivery status",
        "**Reorder** — Place the same order again",
        "**Delivery info** — Charges, timing, and availability",
        "**Payment issues** — Failed transactions or refunds",
        "**Contact support** — Speak to our team",
        "\nJust tell me what you need help with!",
      ],
    };
  }

  const match = findBestMatch(lower);
  if (match) return match;

  if (lower.includes("order")) {
    return {
      response: "I'd be happy to help with your order! Can you give me more details? For example:",
      steps: [
        "**'My order is delayed'** — If it's taking too long",
        "**'Where is my order?'** — To track your delivery",
        "**'I want to cancel'** — If you need to cancel",
        "**'Missing items'** — If something is missing",
        "**'Wrong item'** — If you received something incorrect",
        "**'Defective item'** — If something is damaged or faulty",
      ],
    };
  }

  return {
    response: "I'm not sure I understood your query. Let me help you narrow it down:",
    steps: [
      "Try rephrasing your query, for example:",
      "• **'My order is delayed'** — Late delivery",
      "• **'My item is defective'** — Damaged or faulty product",
      "• **'I want a refund'** — Returns and refunds",
      "• **'Where is my order?'** — Track delivery",
      "• **'I need help with payment'** — Payment issues",
      "Or fill in the contact form below and our support team will get back to you within 24 hours",
    ],
  };
}
