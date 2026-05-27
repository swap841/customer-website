"use client";

import {
  Truck,
  MapPin,
  Clock,
  Package,
  ShieldCheck,
  IndianRupee,
  RotateCcw,
  Mail,
  Phone,
  HeadphonesIcon,
  Store,
  CheckCircle2,
  Navigation,
  Fuel,
  PiggyBank,
  Globe,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { useContactInfo } from "@/hooks/useContactInfo";

export default function ShippingPolicyPage() {
  const { contactInfo } = useContactInfo();

  if (contactInfo.shippingPolicy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white">
          <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm">
                <Truck className="w-10 h-10 text-emerald-200" />
              </div>
              <div>
                <p className="text-emerald-200 text-sm font-medium tracking-wider uppercase">Policies</p>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Shipping & Delivery Policy</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8 prose prose-emerald prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: contactInfo.shippingPolicy }} />
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
              <Truck className="w-10 h-10 text-emerald-200" />
            </div>
            <div>
              <p className="text-emerald-200 text-sm font-medium tracking-wider uppercase">
                Policies
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                🚚 Shipping &amp; Delivery Policy
              </h1>
            </div>
          </div>
          <p className="text-emerald-100 text-lg max-w-2xl leading-relaxed">
            We strive to deliver your orders promptly and reliably. This policy
            explains our shipping practices, delivery timelines, and fees.
          </p>
        </div>
      </div>

      {/* Quick Info Banner */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-lg p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <MapPin className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-700">20 km</p>
              <p className="text-xs text-gray-600 mt-1">Local Delivery Radius</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <Clock className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-700">24-48 hrs</p>
              <p className="text-xs text-gray-600 mt-1">Standard Delivery</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <IndianRupee className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-700">₹499+</p>
              <p className="text-xs text-gray-600 mt-1">Free Delivery Above</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <Store className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-700">Free</p>
              <p className="text-xs text-gray-600 mt-1">Store Pickup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Section 1: Service Area */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                1
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                  Service Area
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-6 text-gray-700 leading-relaxed">
              <p>
                My Store Grocery operates a tiered delivery network to ensure
                your groceries reach you fresh and on time:
              </p>

              {/* Local Delivery */}
              <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                <h3 className="font-bold text-emerald-800 text-lg mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Local Delivery (Within 20 km Radius)
                </h3>
                <ul className="space-y-2 text-emerald-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✓</span>
                    <span>
                      Direct delivery by our <strong>in-house fleet</strong>{" "}
                      with temperature-controlled vehicles for perishable items.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✓</span>
                    <span>
                      Available across Mumbai, Navi Mumbai, and Thane
                      metropolitan areas.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✓</span>
                    <span>
                      Same-day delivery available for orders placed before{" "}
                      <strong>12:00 PM</strong> (subject to availability).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">✓</span>
                    <span>
                      Express delivery (within 2-4 hours) available in select
                      pin codes at an additional charge.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Extended Delivery */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-bold text-blue-800 text-lg mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Out-of-City & Extended Delivery
                </h3>
                <ul className="space-y-2 text-blue-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1">→</span>
                    <span>
                      Delivery to locations beyond 20 km is fulfilled through
                      our{" "}
                      <strong>trusted third-party logistics partners</strong>{" "}
                      (e.g., Delhivery, DTDC, BlueDart).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">→</span>
                    <span>
                      Available for non-perishable grocery items, pantry
                      staples, and packaged goods only.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">→</span>
                    <span>
                      Delivery timeline: <strong>3-7 business days</strong>{" "}
                      depending on the destination and pin code serviceability.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">→</span>
                    <span>
                      Currently serving select cities across Maharashtra,
                      Gujarat, Karnataka, and Goa. Check pin code availability
                      at checkout.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-700 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    <strong>Pin Code Check:</strong> Enter your delivery pin code
                    on our website or app to verify serviceability and estimated
                    delivery time before placing your order.
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Delivery Times */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                2
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-emerald-600" />
                  Delivery Times & Slots
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                We offer flexible delivery slots to suit your schedule:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-emerald-50">
                      <th className="text-left p-3 font-semibold text-emerald-800 border border-emerald-100">
                        Delivery Type
                      </th>
                      <th className="text-left p-3 font-semibold text-emerald-800 border border-emerald-100">
                        Timeline
                      </th>
                      <th className="text-left p-3 font-semibold text-emerald-800 border border-emerald-100">
                        Availability
                      </th>
                      <th className="text-left p-3 font-semibold text-emerald-800 border border-emerald-100">
                        Cut-off Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-emerald-100 font-medium">
                        Express Delivery
                      </td>
                      <td className="p-3 border border-emerald-100">
                        2-4 hours
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Select pin codes
                      </td>
                      <td className="p-3 border border-emerald-100">
                        6:00 PM
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-3 border border-emerald-100 font-medium">
                        Same-Day Delivery
                      </td>
                      <td className="p-3 border border-emerald-100">
                        By end of day
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Local area (20 km)
                      </td>
                      <td className="p-3 border border-emerald-100">
                        12:00 PM
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-emerald-100 font-medium">
                        Standard Delivery
                      </td>
                      <td className="p-3 border border-emerald-100">
                        24-48 hours
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Local area (20 km)
                      </td>
                      <td className="p-3 border border-emerald-100">
                        No cut-off
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-3 border border-emerald-100 font-medium">
                        Scheduled Delivery
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Choose your slot
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Local area (20 km)
                      </td>
                      <td className="p-3 border border-emerald-100">
                        24 hrs prior
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-emerald-100 font-medium">
                        Out-of-City
                      </td>
                      <td className="p-3 border border-emerald-100">
                        3-7 business days
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Select cities
                      </td>
                      <td className="p-3 border border-emerald-100">
                        No cut-off
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-emerald-700 text-sm">
                  <strong>Available Delivery Slots:</strong> Morning (8 AM - 12
                  PM), Afternoon (12 PM - 4 PM), Evening (4 PM - 8 PM). Slot
                  availability may vary based on demand and location.
                </p>
              </div>
              <p className="text-sm text-gray-500">
                <strong>Note:</strong> Delivery times are estimates and may vary
                during festivals, adverse weather conditions, natural
                calamities, or unforeseen circumstances. We will notify you of
                any significant delays.
              </p>
            </div>
          </section>

          {/* Section 3: Delivery Charges */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                3
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <IndianRupee className="w-6 h-6 text-emerald-600" />
                  Delivery Charges
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                We strive to keep delivery charges affordable. Here is our
                transparent pricing structure:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-5 border border-green-200 text-center">
                  <p className="text-sm font-medium text-green-700 uppercase tracking-wider">
                    Orders above ₹499
                  </p>
                  <p className="text-4xl font-bold text-green-600 mt-2">
                    FREE
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Standard local delivery
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200 text-center">
                  <p className="text-sm font-medium text-emerald-700 uppercase tracking-wider">
                    Orders below ₹499
                  </p>
                  <p className="text-4xl font-bold text-emerald-600 mt-2">
                    ₹29
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Standard delivery fee
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-emerald-50">
                      <th className="text-left p-3 font-semibold text-emerald-800 border border-emerald-100">
                        Service
                      </th>
                      <th className="text-left p-3 font-semibold text-emerald-800 border border-emerald-100">
                        Charge
                      </th>
                      <th className="text-left p-3 font-semibold text-emerald-800 border border-emerald-100">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3 border border-emerald-100 font-medium">
                        Express Delivery
                      </td>
                      <td className="p-3 border border-emerald-100">₹49</td>
                      <td className="p-3 border border-emerald-100">
                        Additional to standard charges
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-3 border border-emerald-100 font-medium">
                        Scheduled Delivery
                      </td>
                      <td className="p-3 border border-emerald-100">Free</td>
                      <td className="p-3 border border-emerald-100">
                        Same as standard delivery
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 border border-emerald-100 font-medium">
                        Out-of-City Shipping
                      </td>
                      <td className="p-3 border border-emerald-100">
                        ₹79 - ₹199
                      </td>
                      <td className="p-3 border border-emerald-100">
                        Based on weight & distance
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-3 border border-emerald-100 font-medium">
                        Store Pickup
                      </td>
                      <td className="p-3 border border-emerald-100">Free</td>
                      <td className="p-3 border border-emerald-100">
                        Always free, no minimum order
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500">
                Delivery charges are calculated at checkout and displayed before
                payment confirmation. Promotional free delivery offers may apply
                periodically.
              </p>
            </div>
          </section>

          {/* Section 4: Order Tracking */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                4
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Smartphone className="w-6 h-6 text-emerald-600" />
                  Order Tracking
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                Stay updated on your order status every step of the way:
              </p>

              {/* Tracking Steps */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div className="w-0.5 h-10 bg-emerald-200" />
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-gray-900">Order Confirmed</p>
                    <p className="text-sm text-gray-600">
                      Receive instant confirmation via SMS, email, and in-app
                      notification with your order ID.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div className="w-0.5 h-10 bg-emerald-200" />
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-gray-900">Being Packed</p>
                    <p className="text-sm text-gray-600">
                      Your items are being carefully picked and packed at our
                      store or fulfilment centre.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div className="w-0.5 h-10 bg-emerald-200" />
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-gray-900">Out for Delivery</p>
                    <p className="text-sm text-gray-600">
                      Your order is on the way! Track your delivery partner in
                      real-time on the app with live map view.
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
                    <p className="font-bold text-gray-900">Delivered</p>
                    <p className="text-sm text-gray-600">
                      Order delivered! Please inspect and confirm. Rate your
                      delivery experience.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <h4 className="font-semibold text-emerald-800 mb-2">
                    Track Via App
                  </h4>
                  <p className="text-sm text-gray-600">
                    Open the My Store Grocery app → My Orders → select your
                    order to view real-time tracking with live map.
                  </p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <h4 className="font-semibold text-emerald-800 mb-2">
                    Track Via Website
                  </h4>
                  <p className="text-sm text-gray-600">
                    Visit mystoregrocery.in → Log in → My Orders → click on
                    &quot;Track Order&quot; for status updates and estimated arrival.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Store Pickup */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                5
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Store className="w-6 h-6 text-emerald-600" />
                  Store Pickup (Click & Collect)
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                Prefer to pick up your order yourself? Our Click & Collect
                service is completely free with no minimum order requirement:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">How It Works:</strong>{" "}
                    Place your order online, select &quot;Store Pickup&quot; at checkout,
                    and choose your preferred store location and pickup time
                    slot.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Ready Notification:</strong>{" "}
                    You will receive an SMS and app notification when your order
                    is packed and ready for collection.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Pickup Window:</strong>{" "}
                    Orders must be collected within{" "}
                    <strong>48 hours</strong> of the ready notification. Uncollected
                    orders will be cancelled and refunded after this period.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Identification:</strong>{" "}
                    Please bring a valid photo ID and your order confirmation
                    (digital or printed) for verification during pickup.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">Store Hours:</strong>{" "}
                    Pickup is available during store operating hours — Monday to
                    Sunday, 7:00 AM to 10:00 PM.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 6: Additional Information */}
          <section className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4 mb-5">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-lg shrink-0">
                6
              </span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6 text-emerald-600" />
                  Packaging & Handling
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-gray-700 leading-relaxed">
              <p>
                We are committed to sustainable packaging and safe handling of
                your groceries:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Temperature Control:
                    </strong>{" "}
                    Frozen and chilled items are packed with insulated bags and
                    ice packs to maintain freshness during transit.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Eco-Friendly Packaging:
                    </strong>{" "}
                    We use biodegradable and recyclable packaging materials
                    wherever possible, reducing our environmental footprint.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Segregated Packing:
                    </strong>{" "}
                    Heavy items, fragile items, and perishables are packed
                    separately to prevent damage.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>
                    <strong className="text-gray-900">
                      Bag Return Programme:
                    </strong>{" "}
                    Return your My Store Grocery bags to our delivery partner on
                    the next delivery and earn reward points!
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-start gap-4 mb-5">
              <div className="p-2 bg-white/20 rounded-xl">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Questions About Delivery?
                </h2>
              </div>
            </div>
            <div className="ml-14 space-y-4 text-emerald-50 leading-relaxed">
              <p>
                If you have questions about delivery, need to update your
                delivery address, or want to reschedule a delivery, contact our
                support team:
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
