"use client";

import {
  FileText,
  Scale,
  UserCheck,
  AlertTriangle,
  Ban,
  Mail,
  Phone,
  MapPin,
  Shield,
  Gavel,
  Users,
  ShoppingCart,
  IndianRupee,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useContactInfo } from "@/hooks/useContactInfo";

export default function TermsAndConditionsPage() {
  const { contactInfo } = useContactInfo();

  if (contactInfo.termsAndConditions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white">
          <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm">
                <FileText className="w-10 h-10 text-emerald-200" />
              </div>
              <div>
                <p className="text-emerald-200 text-sm font-medium tracking-wider uppercase">Legal</p>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Terms & Conditions</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 prose prose-emerald prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: contactInfo.termsAndConditions }} />
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
              <FileText className="w-10 h-10 text-emerald-200" />
            </div>
            <div>
              <p className="text-emerald-200 text-sm font-medium tracking-wider uppercase">
                Legal
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                📜 Terms &amp; Conditions
              </h1>
            </div>
          </div>
          <p className="text-emerald-100 text-lg max-w-2xl leading-relaxed">
            By using our platform, you agree to these terms. Please read them
            carefully to understand your rights and obligations when using the
            {contactInfo.storeName} platform.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {[
            {
              number: 1,
              icon: <FileText className="w-6 h-6 text-emerald-600" />,
              title: "Introduction & Acceptance of Terms",
              content: (
                <div className="space-y-4">
                  <p>
                    1. Acceptance of Terms By accessing or using the platform,
                    you acknowledge that you have read, understood, and agree to
                    be bound by these Terms. If you do not agree with any part
                    of these Terms, you must not use our services.
                  </p>
                  <p>
                    These Terms constitute a legally binding agreement between
                    you (&quot;User&quot;) and {contactInfo.storeName} (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) regarding your use of the
                    platform.
                  </p>
                  <p>
                    The Company reserves the right to update or modify these
                    Terms at any time without prior notice. Your continued use
                    of the platform following any changes constitutes your
                    acceptance of the new Terms.
                  </p>
                </div>
              ),
            },
            {
              number: 2,
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      title: "Account Registration & Eligibility",
      content: (
        <div className="space-y-4">
          <p>
            To use certain features of our platform, you must create an account
            and meet the following eligibility criteria:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                You must be at least <strong>18 years of age</strong> or have
                the consent of a parent/guardian to use our services.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                You must provide <strong>accurate, current, and complete</strong>{" "}
                information during registration and keep it updated.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                You are solely responsible for maintaining the{" "}
                <strong>confidentiality of your login credentials</strong> and
                for all activities under your account.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                You must <strong>immediately notify us</strong> of any
                unauthorised access to your account at
                support@mystoregrocery.in.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                We reserve the right to{" "}
                <strong>suspend or terminate accounts</strong> that violate
                these Terms or engage in fraudulent activity.
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      number: 3,
      icon: <ShoppingCart className="w-6 h-6 text-emerald-600" />,
      title: "Orders & Product Availability",
      content: (
        <div className="space-y-4">
          <p>
            When you place an order through our platform, you make an offer to
            purchase the selected products subject to the following conditions:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                All orders are subject to{" "}
                <strong>availability and acceptance</strong> by us. We reserve
                the right to refuse or cancel any order at our discretion.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Product images are <strong>indicative</strong> and actual
                products may vary slightly in appearance, packaging, or weight.
                For fresh produce and perishable items, natural variations are
                expected.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                We strive to maintain accurate stock information; however, in
                cases of <strong>stock-out</strong>, we may substitute with a
                product of equal or higher value with your consent, or issue a
                refund for the unavailable item.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                An order confirmation email/SMS does not constitute acceptance.
                The contract is formed only when the{" "}
                <strong>order is dispatched</strong>.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                <strong>Minimum order value</strong> and{" "}
                <strong>maximum order quantity</strong> restrictions may apply as
                specified on the platform.
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      number: 4,
      icon: <IndianRupee className="w-6 h-6 text-emerald-600" />,
      title: "Pricing & Payment",
      content: (
        <div className="space-y-4">
          <p>
            All prices displayed on our platform are in Indian Rupees (₹) and
            are inclusive of applicable GST unless otherwise stated:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Prices are subject to change without prior notice. The price
                applicable is the one displayed at the{" "}
                <strong>time of placing your order</strong>.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                In case of <strong>pricing errors</strong> (e.g., due to
                technical glitches), we reserve the right to cancel the order
                and issue a full refund.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                We accept payments via{" "}
                <strong>
                  UPI, credit/debit cards, net banking, wallets, and Cash on
                  Delivery (COD)
                </strong>{" "}
                where available. All online payments are processed through
                RBI-authorised payment gateways.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                <strong>GST invoices</strong> will be issued for all orders as
                per applicable tax regulations. GSTIN:
                27AABCM1234A1Z5.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Promotional discounts, coupons, and offers are subject to
                specific terms, may have{" "}
                <strong>usage limits and expiry dates</strong>, and cannot be
                combined unless explicitly stated.
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      number: 5,
      icon: <Truck className="w-6 h-6 text-emerald-600" />,
      title: "Delivery Terms",
      content: (
        <div className="space-y-4">
          <p>
            We endeavour to deliver your orders within the estimated time frame;
            however, delivery times are indicative and not guaranteed:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Standard delivery within our service area is typically{" "}
                <strong>24 to 48 hours</strong> from order confirmation, subject
                to product availability and weather conditions.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                <strong>Risk of loss and title</strong> for products passes to
                you upon delivery at the specified delivery address.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                You must ensure that someone is available to{" "}
                <strong>receive the delivery</strong> at the specified address.
                Failed delivery attempts may result in additional delivery
                charges.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                We shall not be liable for delays caused by{" "}
                <strong>force majeure events</strong> including but not limited
                to natural disasters, strikes, lockdowns, or government
                restrictions.
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      number: 6,
      icon: <RotateCcw className="w-6 h-6 text-emerald-600" />,
      title: "Returns, Refunds & Cancellations",
      content: (
        <div className="space-y-4">
          <p>
            Our returns and refund policy is designed to ensure customer
            satisfaction while maintaining fair business practices:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Orders may be <strong>cancelled free of charge</strong> before
                dispatch. Cancellation after dispatch may attract a cancellation
                fee.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Returns are accepted for{" "}
                <strong>damaged, defective, or incorrect items</strong> reported
                within 24 hours of delivery with photographic evidence.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                <strong>Perishable items</strong> (fruits, vegetables, dairy,
                meat) must be inspected at the time of delivery. Claims after
                acceptance may not be entertained.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Approved refunds will be processed within{" "}
                <strong>3-5 business days</strong> to the original payment
                method. COD refunds will be credited to your store wallet or
                bank account.
              </span>
            </li>
          </ul>
          <p className="text-sm text-gray-500">
            For detailed information, please refer to our dedicated{" "}
            <a
              href="/refund-policy"
              className="text-emerald-600 underline hover:text-emerald-700"
            >
              Refund Policy
            </a>{" "}
            page.
          </p>
        </div>
      ),
    },
    {
      number: 7,
      icon: <AlertTriangle className="w-6 h-6 text-emerald-600" />,
      title: "Limitation of Liability",
      content: (
        <div className="space-y-4">
          <p>
            To the maximum extent permitted by applicable Indian law:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Our platform and services are provided on an{" "}
                <strong>&quot;as is&quot; and &quot;as available&quot;</strong> basis without
                warranties of any kind, whether express or implied.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                We shall not be liable for any{" "}
                <strong>
                  indirect, incidental, special, consequential, or punitive
                  damages
                </strong>
                , including but not limited to loss of profits, data, or
                goodwill.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Our total aggregate liability for any claims arising out of or
                relating to these Terms or the services shall not exceed the{" "}
                <strong>
                  total amount paid by you in the 12 months preceding the claim
                </strong>
                .
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                We do not guarantee uninterrupted, secure, or error-free
                operation of the platform. We are not liable for losses arising
                from{" "}
                <strong>
                  technical failures, internet disruptions, or third-party
                  service outages
                </strong>
                .
              </span>
            </li>
          </ul>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">
              <strong>Indemnification:</strong> You agree to indemnify and hold
              harmless My Store Grocery Logistics Pvt. Ltd., its directors,
              officers, employees, and agents from any claims, damages, or
              expenses arising from your breach of these Terms or misuse of our
              services.
            </p>
          </div>
        </div>
      ),
    },
    {
      number: 8,
      icon: <Gavel className="w-6 h-6 text-emerald-600" />,
      title: "Governing Law & Dispute Resolution",
      content: (
        <div className="space-y-4">
          <p>
            These Terms and Conditions shall be governed by and construed in
            accordance with the laws of India:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                These Terms are governed by the{" "}
                <strong>
                  Indian Contract Act, 1872; the Information Technology Act,
                  2000; the Consumer Protection Act, 2019
                </strong>
                ; and other applicable Indian legislation.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Any dispute arising out of or in connection with these Terms
                shall first be attempted to be resolved through{" "}
                <strong>amicable negotiation</strong> within 30 days.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                If negotiation fails, the dispute shall be referred to{" "}
                <strong>
                  arbitration under the Arbitration and Conciliation Act, 1996
                </strong>
                , with a sole arbitrator appointed mutually. The seat of
                arbitration shall be Mumbai, Maharashtra.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                The <strong>courts of Mumbai</strong> shall have exclusive
                jurisdiction over any proceedings relating to these Terms.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Consumer complaints may also be filed on the{" "}
                <strong>
                  National Consumer Helpline (NCH) at 1800-11-4000
                </strong>{" "}
                or through the e-Daakhil portal (
                <em>edaakhil.nic.in</em>).
              </span>
            </li>
          </ul>
        </div>
      ),
    },
  ].map((section) => (
            <section
              key={section.number}
              className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 mb-5">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                  {section.number}
                </span>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {section.icon}
                    {section.title}
                  </h2>
                </div>
              </div>
              <div className="ml-14 text-gray-700 leading-relaxed">
                {section.content}
              </div>
            </section>
          ))}

          {/* Contact Section */}
          <section className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-start gap-4 mb-5">
              <div className="p-2 bg-white/20 rounded-xl">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Questions About Our Terms?</h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-emerald-50 leading-relaxed">
              <p>
                If you have any questions or concerns about these Terms and
                Conditions, please do not hesitate to contact us:
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 space-y-3">
                <p className="font-bold text-white text-lg">
                  {contactInfo.storeName}
                </p>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-200 mt-0.5 shrink-0" />
                  <p>{contactInfo.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-200 shrink-0" />
                  <p>{contactInfo.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-200 shrink-0" />
                  <p>{contactInfo.phone}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-400 border-t border-gray-200 pt-8">
          <p>Last Updated: January 2026</p>
          <p className="mt-1">
            © 2026 {contactInfo.storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
