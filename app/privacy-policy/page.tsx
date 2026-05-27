"use client";

import { Shield, Lock, Eye, Database, Mail, Phone, MapPin } from "lucide-react";
import { useContactInfo } from "@/hooks/useContactInfo";

export default function PrivacyPolicyPage() {
  const { contactInfo } = useContactInfo();

  if (contactInfo.privacyPolicy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white">
          <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm">
                <Shield className="w-10 h-10 text-emerald-200" />
              </div>
              <div>
                <p className="text-emerald-200 text-sm font-medium tracking-wider uppercase">Legal</p>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Privacy Policy</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 prose prose-emerald prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: contactInfo.privacyPolicy }} />
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
              <Shield className="w-10 h-10 text-emerald-200" />
            </div>
            <div>
              <p className="text-emerald-200 text-sm font-medium tracking-wider uppercase">
                Legal
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                🛡️ Privacy Policy
              </h1>
            </div>
          </div>
          <p className="text-emerald-100 text-lg max-w-2xl leading-relaxed">
            Your privacy is important to us. This policy explains how {contactInfo.storeName} collects, uses, and protects your
            personal information in compliance with the Information Technology
            Act, 2000 and the Consumer Protection Act, 2019.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Section 1 */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                1
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Database className="w-6 h-6 text-emerald-600" />
                  Information We Collect
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                We collect and process the following categories of personal
                information when you use our platform:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <h3 className="font-semibold text-emerald-800 mb-2">
                    Personal Details
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Full name and date of birth</li>
                    <li>• Email address and phone number</li>
                    <li>• Delivery address(es)</li>
                    <li>• Gender (optional)</li>
                  </ul>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <h3 className="font-semibold text-emerald-800 mb-2">
                    Transaction Data
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Order history and preferences</li>
                    <li>• Payment information (tokenised)</li>
                    <li>• UPI IDs & wallet details</li>
                    <li>• Invoice and billing records</li>
                  </ul>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <h3 className="font-semibold text-emerald-800 mb-2">
                    Technical Data
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• IP address and browser type</li>
                    <li>• Device identifiers</li>
                    <li>• Location data (with consent)</li>
                    <li>• App usage analytics</li>
                  </ul>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <h3 className="font-semibold text-emerald-800 mb-2">
                    Communication Data
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Customer support interactions</li>
                    <li>• Feedback and reviews</li>
                    <li>• Survey responses</li>
                    <li>• Marketing preferences</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                2
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-emerald-600" />
                  How We Use Your Information
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                We use your personal information for the following legitimate
                purposes:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Order Fulfilment:</strong>{" "}
                    Processing, delivering, and managing your grocery orders,
                    including real-time delivery tracking and notifications.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Account Management:
                    </strong>{" "}
                    Creating and maintaining your account, authenticating logins,
                    and managing your preferences and saved addresses.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Payment Processing:</strong>{" "}
                    Securely processing payments through RBI-compliant payment
                    gateways, handling refunds, and managing billing.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Personalisation:</strong>{" "}
                    Recommending products based on your purchase history,
                    providing tailored offers, and improving your shopping
                    experience.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Communication:
                    </strong>{" "}
                    Sending order confirmations, delivery updates, promotional
                    offers (with your consent), and responding to your queries.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Legal Compliance:
                    </strong>{" "}
                    Complying with applicable Indian laws, regulations, and legal
                    processes including GST invoicing requirements.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                3
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Third-Party Sharing & Disclosure
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                We do not sell your personal information. We may share your data
                with trusted third parties only in the following circumstances:
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="font-semibold text-amber-800 mb-2">
                  ⚠️ Important Notice
                </p>
                <p className="text-amber-700 text-sm">
                  We never sell, rent, or trade your personal information to
                  third parties for their marketing purposes without your
                  explicit consent.
                </p>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Delivery Partners:
                    </strong>{" "}
                    We share your name, address, and phone number with our
                    delivery partners solely for the purpose of delivering your
                    orders.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Payment Processors:
                    </strong>{" "}
                    Payment data is shared with PCI-DSS compliant payment
                    gateways such as Razorpay, Paytm, or PhonePe for secure
                    transaction processing.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Legal Authorities:
                    </strong>{" "}
                    When required by law, court order, or government authority
                    under the provisions of the IT Act, 2000 or other applicable
                    Indian legislation.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Analytics Providers:
                    </strong>{" "}
                    Anonymised and aggregated data may be shared with analytics
                    partners to improve our platform and services.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                4
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Cookies & Tracking Technologies
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                Our website and mobile application use cookies and similar
                tracking technologies to enhance your experience:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-emerald-50">
                      <th className="text-left p-3 font-semibold text-emerald-800 border border-emerald-100 rounded-tl-lg">
                        Cookie Type
                      </th>
                      <th className="text-left p-3 font-semibold text-emerald-800 border border-emerald-100">
                        Purpose
                      </th>
                      <th className="text-left p-3 font-semibold text-emerald-800 border border-emerald-100 rounded-tr-lg">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-emerald-100 font-medium">
                        Essential
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Login sessions, cart items, security tokens
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Session
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-3 border border-emerald-100 font-medium">
                        Functional
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Language, region, and preference settings
                      </td>
                      <td className="p-3 border border-emerald-100">1 year</td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-emerald-100 font-medium">
                        Analytics
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Usage patterns, page views, performance metrics
                      </td>
                      <td className="p-3 border border-emerald-100">
                        2 years
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-3 border border-emerald-100 font-medium">
                        Marketing
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Personalised ads and promotional content
                      </td>
                      <td className="p-3 border border-emerald-100">
                        90 days
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500">
                You can manage your cookie preferences through your browser
                settings. Disabling essential cookies may affect the
                functionality of our platform.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                5
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Data Retention
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                We retain your personal information only for as long as
                necessary to fulfil the purposes outlined in this policy:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Account Data:</strong>{" "}
                    Retained for the duration of your active account and up to 3
                    years after account deletion.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Transaction Records:
                    </strong>{" "}
                    Retained for a minimum of 8 years as required under the
                    Indian Income Tax Act and GST regulations.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Communication Logs:
                    </strong>{" "}
                    Customer support interactions are retained for up to 2 years
                    for quality assurance and dispute resolution.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Analytics Data:</strong>{" "}
                    Anonymised analytics data may be retained indefinitely for
                    business intelligence purposes.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                6
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-emerald-600" />
                  Data Security
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                We implement robust security measures to protect your personal
                information in accordance with the Information Technology
                (Reasonable Security Practices and Procedures and Sensitive
                Personal Data or Information) Rules, 2011:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <Lock className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-800">Encryption</p>
                    <p className="text-sm text-gray-600">
                      256-bit SSL/TLS encryption for all data in transit and
                      AES-256 encryption for data at rest.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <Shield className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-800">
                      Access Control
                    </p>
                    <p className="text-sm text-gray-600">
                      Role-based access controls, multi-factor authentication,
                      and regular access audits.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <Database className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-800">
                      Secure Storage
                    </p>
                    <p className="text-sm text-gray-600">
                      Data stored on secure Indian servers with regular backups
                      and disaster recovery protocols.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <Eye className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-800">Monitoring</p>
                    <p className="text-sm text-gray-600">
                      24/7 security monitoring, intrusion detection systems, and
                      regular vulnerability assessments.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                7
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Your Rights
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                Under the Information Technology Act, 2000 and the Digital
                Personal Data Protection Act, 2023, you have the following
                rights regarding your personal data:
              </p>
              <div className="space-y-3">
                {[
                  {
                    title: "Right to Access",
                    desc: "Request a copy of the personal data we hold about you.",
                  },
                  {
                    title: "Right to Correction",
                    desc: "Request correction of any inaccurate or incomplete personal data.",
                  },
                  {
                    title: "Right to Erasure",
                    desc: "Request deletion of your personal data, subject to legal retention requirements.",
                  },
                  {
                    title: "Right to Withdraw Consent",
                    desc: "Withdraw your consent for data processing at any time by contacting us.",
                  },
                  {
                    title: "Right to Grievance Redressal",
                    desc: "Lodge a complaint with our Grievance Officer or the appropriate Data Protection Authority.",
                  },
                ].map((right) => (
                  <div
                    key={right.title}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <span className="mt-0.5 text-emerald-600">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {right.title}
                      </p>
                      <p className="text-sm text-gray-600">{right.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                To exercise any of these rights, please contact our Grievance
                Officer at the details provided below. We will respond within 30
                days of receiving your request.
              </p>
            </div>
          </section>

          {/* Section 8 - Contact */}
          <section className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 text-white font-bold text-lg shrink-0">
                8
              </span>
              <div>
                <h2 className="text-2xl font-bold">
                  Contact Us & Grievance Officer
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-emerald-50 leading-relaxed">
              <p>
                If you have any questions, concerns, or complaints regarding
                this Privacy Policy or our data practices, please contact our
                designated Grievance Officer:
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
                If you are not satisfied with our response, you may lodge a
                complaint with the Data Protection Board of India established
                under the Digital Personal Data Protection Act, 2023.
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
