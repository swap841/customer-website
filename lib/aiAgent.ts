export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  steps?: string[];
}

const greetings = ["hi", "hello", "hey", "help", "start"];

const patterns: { keywords: string[]; response: string; steps: string[] }[] = [
  {
    keywords: ["defective", "damaged", "broken", "not working", "faulty"],
    response:
      "I'm sorry to hear your item arrived defective! Here's how to report it:",
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
    keywords: ["missing", "didn't receive", "not delivered", "shortage"],
    response:
      "I understand some items were missing from your delivery. Here's how to report it:",
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
    keywords: ["wrong", "incorrect", "not what i ordered", "different item"],
    response:
      "It looks like you received the wrong item. Let's fix that:",
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
    keywords: ["return", "refund", "money back", "cancel order"],
    response:
      "For returns and refunds, here's what to do:",
    steps: [
      "Go to your **Profile** page",
      "Click on the **Delivered** order you want to return",
      "Scroll down to **Request Return**",
      "Enter the reason and submit",
      "Our team will process your refund within 5-7 business days",
    ],
  },
  {
    keywords: ["track", "where is my order", "delivery status", "shipping"],
    response:
      "To track your order in real-time:",
    steps: [
      "Go to your **Profile** page",
      "Look under **Current Orders**",
      "Click on any order to see its **live status**",
      "You'll see the progress: Pending → Packing → Out for Delivery → Delivered",
      "If assigned to a delivery boy, you can see their real-time location",
    ],
  },
  {
    keywords: ["reorder", "order again", "repeat", "same order"],
    response:
      "Want to order the same items again? Easy:",
    steps: [
      "Go to your **Profile** page",
      "Scroll to **Past Orders**",
      "Find the order you want to repeat",
      "Click the **Reorder** button",
      "A new order with the same items will be placed",
    ],
  },
  {
    keywords: ["update address", "change address", "edit profile", "phone number"],
    response:
      "To update your profile details:",
    steps: [
      "Go to your **Profile** page",
      "Edit your **Name**, **Phone**, or **Address** in the form on the left",
      "Click **Save Profile** to confirm changes",
    ],
  },
  {
    keywords: ["payment", "paid", "charge", "razorpay", "failed payment"],
    response:
      "For payment-related queries:",
    steps: [
      "Check your order status on the **Profile** page",
      "If payment failed, you can retry from the **Cart** page",
      "For refunds, raise a return request from the order page",
      "Contact our support team below if you need further help",
    ],
  },
  {
    keywords: ["contact", "speak to", "agent", "human", "support"],
    response:
      "I'll connect you with our support team. Please fill in the form below and we'll get back to you within 24 hours.",
    steps: [
      "Fill in your name, email, and message in the form below",
      "Our team will respond to your email",
    ],
  },
  {
    keywords: ["coupon", "discount", "promo", "offer"],
    response:
      "Looking for discounts? Here's how to use coupons:",
    steps: [
      "Browse our **Products** page and add items to your cart",
      "On the **Checkout** page, enter your coupon code in the coupon field",
      "Click **Apply** to see the discount",
      "Complete your purchase to enjoy the savings!",
    ],
  },
];

function findMatch(input: string): { response: string; steps: string[] } | null {
  const lower = input.toLowerCase();
  for (const p of patterns) {
    if (p.keywords.some((kw) => lower.includes(kw))) {
      return { response: p.response, steps: p.steps };
    }
  }
  return null;
}

export function getAIResponse(input: string): { response: string; steps: string[] } {
  const lower = input.trim().toLowerCase();

  if (!lower || greetings.some((g) => lower === g || lower.startsWith(g))) {
    return {
      response:
        "Hello! I'm your shopping assistant. I can help you with:",
      steps: [
        "**Defective items** — Report a damaged or faulty product",
        "**Missing items** — Report items not received",
        "**Wrong order** — Report incorrect items",
        "**Returns & Refunds** — Request a return or refund",
        "**Track order** — Check your delivery status",
        "**Reorder** — Place the same order again",
        "**Contact support** — Speak to our team",
        "\nJust tell me what you need help with!",
      ],
    };
  }

  const match = findMatch(lower);
  if (match) return match;

  return {
    response:
      "I'm not sure I understood your query. Let me connect you with our support team.",
    steps: [
      "Please fill in the contact form below with your details",
      "Our support team will get back to you within 24 hours",
      "Or try rephrasing your query — for example: 'My order is defective' or 'I want to return an item'",
    ],
  };
}
