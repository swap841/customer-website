"use client";

import {
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  MapPin,
  XCircle,
  Package,
  CreditCard,
  ShieldAlert,
} from "lucide-react";
import { useContactInfo } from "@/hooks/useContactInfo";

export default function RefundPolicyPage() {
  const { contactInfo } = useContactInfo();

  if (contactInfo.refundPolicy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white">
          <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm">
                <RotateCcw className="w-10 h-10 text-emerald-200" />
              </div>
              <div>
                <p className="text-emerald-200 text-sm font-medium tracking-wider uppercase">Legal</p>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Refund Policy</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 prose prose-emerald prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: contactInfo.refundPolicy }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm">
              <RotateCcw className="w-10 h-10 text-emerald-200" />
            </div>
            <div>
              <p className="text-emerald-200 text-sm font-medium tracking-wider uppercase">
                Legal
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                🔄 Refund Policy
              </h1>
            </div>
          </div>
          <p className="text-emerald-100 text-lg max-w-2xl leading-relaxed">
            We want you to be completely satisfied with every order. This policy
            outlines our cancellation, return, and refund procedures in
            compliance with Indian consumer protection laws.
          </p>
        </div>
      </div>

      {/* Quick Summary Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-lg p-6">
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Quick Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-3xl font-bold text-emerald-700">Free</p>
              <p className="text-sm text-gray-600 mt-1">
                Cancellation before dispatch
              </p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-3xl font-bold text-emerald-700">24 hrs</p>
              <p className="text-sm text-gray-600 mt-1">
                Return window after delivery
              </p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-3xl font-bold text-emerald-700">3-5 days</p>
              <p className="text-sm text-gray-600 mt-1">
                Refund processing time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Section 1: Order Cancellation */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                1
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-emerald-600" />
                  Order Cancellation
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-6 text-gray-700 leading-relaxed">
              {/* Before Dispatch */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="font-bold text-green-800 text-lg mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Before Dispatch
                </h3>
                <ul className="space-y-2 text-green-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✓</span>
                    <span>
                      You may cancel your order <strong>free of charge</strong>{" "}
                      at any time before the order is dispatched from our
                      warehouse or store.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✓</span>
                    <span>
                      Cancellation can be initiated through your account
                      dashboard, the My Store Grocery app, or by contacting
                      customer support.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✓</span>
                    <span>
                      Full refund will be initiated immediately upon successful
                      cancellation.
                    </span>
                  </li>
                </ul>
              </div>

              {/* After Dispatch */}
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <h3 className="font-bold text-amber-800 text-lg mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  After Dispatch
                </h3>
                <ul className="space-y-2 text-amber-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1">⚠</span>
                    <span>
                      Once an order is dispatched, cancellation requests are
                      subject to review and may{" "}
                      <strong>
                        attract a cancellation fee of up to ₹50 or 10% of the
                        order value
                      </strong>{" "}
                      (whichever is lower).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">⚠</span>
                    <span>
                      For perishable items already in transit, cancellation may
                      not be possible. In such cases, you may refuse delivery
                      and request a return.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">⚠</span>
                    <span>
                      If our delivery partner is unable to reach you and the
                      order is returned to us, the refund will be processed
                      after deducting applicable shipping charges.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Company-Initiated Cancellation */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-bold text-blue-800 text-lg mb-3">
                  Company-Initiated Cancellation
                </h3>
                <p className="text-blue-700">
                  We reserve the right to cancel orders due to stock
                  unavailability, pricing errors, suspected fraudulent activity,
                  or delivery constraints. In all such cases, a{" "}
                  <strong>full refund</strong> will be issued without any
                  deductions.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Refund Eligibility */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                2
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  Refund Eligibility
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                You are eligible for a refund or replacement in the following
                circumstances:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Wrong Item Delivered:</strong>{" "}
                    If you receive an item different from what you ordered, you
                    are entitled to a full refund or replacement at no additional
                    cost.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Damaged or Defective Items:</strong>{" "}
                    Products received in a damaged, spoiled, or defective
                    condition qualify for a full refund. See Section 4 for
                    details.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Missing Items:</strong>{" "}
                    If any items from your order are missing, we will refund the
                    cost of the missing items or arrange for a separate delivery.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Expired Products:</strong>{" "}
                    If you receive a product that has passed its expiry date or
                    &quot;best before&quot; date, you are entitled to a full refund.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Quality Issues:</strong>{" "}
                    Products that do not meet the quality standards described on
                    our platform may be returned for a refund.
                  </span>
                </li>
              </ul>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-emerald-700 text-sm">
                  <strong>How to Report:</strong> Report issues within{" "}
                  <strong>24 hours of delivery</strong> through the app, website,
                  or by calling our customer support at +91 98765 43210.
                  Include photographs of the product and packaging for faster
                  resolution.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Refund Process */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                3
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                  Refund Process & Timeline
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                Once your return or cancellation request is approved, the refund
                will be processed as follows:
              </p>

              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div className="w-0.5 h-12 bg-emerald-200" />
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-gray-900">Request Submitted</p>
                    <p className="text-sm text-gray-600">
                      Submit your refund request via app, website, or customer
                      support. You will receive an acknowledgement within 2
                      hours.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div className="w-0.5 h-12 bg-emerald-200" />
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-gray-900">
                      Review & Approval (24-48 hours)
                    </p>
                    <p className="text-sm text-gray-600">
                      Our quality team reviews your request and supporting
                      evidence. You will be notified of the decision via email
                      and SMS.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div className="w-0.5 h-12 bg-emerald-200" />
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-gray-900">
                      Refund Initiated (1-2 business days)
                    </p>
                    <p className="text-sm text-gray-600">
                      Upon approval, the refund is initiated to your original
                      payment method.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-gray-900">
                      Amount Credited (3-5 business days)
                    </p>
                    <p className="text-sm text-gray-600">
                      The refund amount is credited to your account. Bank
                      processing times may vary.
                    </p>
                  </div>
                </div>
              </div>

              {/* Refund Methods Table */}
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-emerald-50">
                      <th className="text-left p-3 font-semibold text-emerald-800 border border-emerald-100">
                        Payment Method
                      </th>
                      <th className="text-left p-3 font-semibold text-emerald-800 border border-emerald-100">
                        Refund To
                      </th>
                      <th className="text-left p-3 font-semibold text-emerald-800 border border-emerald-100">
                        Timeline
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-emerald-100 font-medium">
                        UPI
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Original UPI ID
                      </td>
                      <td className="p-3 border border-emerald-100">
                        1-3 business days
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-3 border border-emerald-100 font-medium">
                        Credit/Debit Card
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Original card
                      </td>
                      <td className="p-3 border border-emerald-100">
                        5-7 business days
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-emerald-100 font-medium">
                        Net Banking
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Bank account
                      </td>
                      <td className="p-3 border border-emerald-100">
                        3-5 business days
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-3 border border-emerald-100 font-medium">
                        Wallet
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Wallet balance
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Instant - 24 hours
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-emerald-100 font-medium">
                        Cash on Delivery
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Store wallet / Bank (NEFT)
                      </td>
                      <td className="p-3 border border-emerald-100">
                        3-5 business days
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 4: Damaged Goods */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                4
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-emerald-600" />
                  Damaged or Spoiled Goods
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                We take the utmost care in packaging and delivering your grocery
                items. However, if you receive damaged or spoiled goods:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Inspect at Delivery:
                    </strong>{" "}
                    We strongly recommend inspecting all items at the time of
                    delivery, especially perishable goods like fruits,
                    vegetables, dairy products, and frozen items.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Report Immediately:
                    </strong>{" "}
                    Damaged items must be reported within{" "}
                    <strong>24 hours of delivery</strong> with clear photographs
                    showing the damage, packaging, and invoice/order details.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Replacement or Refund:
                    </strong>{" "}
                    Based on availability, we will either send a replacement at
                    no extra cost or process a full refund for the damaged items.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">No Return Required:</strong>{" "}
                    For perishable goods, we typically do not require the item to
                    be returned. Photographic evidence is sufficient for
                    processing your claim.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5: Non-Refundable Items */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                5
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-emerald-600" />
                  Non-Refundable Items
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                The following items are generally not eligible for return or
                refund unless they are damaged, defective, or incorrect:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Items with broken seals or tampered packaging (opened by customer)",
                  "Personal care and hygiene products once opened",
                  "Gift cards and store credit vouchers",
                  "Items purchased during flash sales marked as 'non-returnable'",
                  "Items returned after the 24-hour return window",
                  "Products with natural variations (weight, size of fresh produce)",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 bg-red-50 rounded-lg p-3 border border-red-100"
                  >
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-red-700">{item}</span>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-4">
                <p className="text-emerald-700 text-sm">
                  <strong>Consumer Rights:</strong> Notwithstanding the above,
                  your statutory rights under the Consumer Protection Act, 2019
                  remain unaffected. If you believe an item is genuinely
                  defective, please contact our support team for assistance.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-start gap-4 mb-5">
              <div className="p-2 bg-white/20 rounded-xl">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Need Help with a Refund?
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-emerald-50 leading-relaxed">
              <p>
                Our customer support team is available to assist you with
                cancellations, returns, and refunds. Reach out to us:
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
                <p className="font-bold text-white text-lg">
                  My Store Grocery Logistics Pvt. Ltd.
                </p>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-200 mt-0.5 shrink-0" />
                  <p>
                    102, Emerald Heights, Business Park, Andheri East, Mumbai,
                    Maharashtra - 400069
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-200 shrink-0" />
                  <p>support@mystoregrocery.in</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-200 shrink-0" />
                  <p>+91 98765 43210</p>
                </div>
              </div>
              <p className="text-sm text-emerald-200">
                Customer support hours: Monday to Saturday, 8:00 AM to 10:00 PM
                IST. Sunday: 9:00 AM to 6:00 PM IST.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-400 border-t border-gray-200 pt-8">
          <p>Last Updated: January 2026</p>
          <p className="mt-1">
            © 2026 My Store Grocery Logistics Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
