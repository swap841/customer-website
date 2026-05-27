// components/TimeSlotPicker.tsx
"use client";

import { Clock } from "lucide-react";

export type TimeSlot = "morning" | "afternoon" | "evening";

interface TimeSlotPickerProps {
  selectedSlot: TimeSlot;
  onSelectSlot: (slot: TimeSlot) => void;
}

const slots: { id: TimeSlot; label: string; time: string; icon: string }[] = [
  { id: "morning", label: "Morning", time: "8 AM – 12 PM", icon: "🌅" },
  { id: "afternoon", label: "Afternoon", time: "12 PM – 5 PM", icon: "☀️" },
  { id: "evening", label: "Evening", time: "5 PM – 9 PM", icon: "🌆" },
];

export default function TimeSlotPicker({ selectedSlot, onSelectSlot }: TimeSlotPickerProps) {
  return (
    <div className="rounded-xl border border-gray-300 p-4 bg-gray-50">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        <Clock className="w-3.5 h-3.5 inline mr-1" />
        Preferred Delivery Time Slot
      </label>
      <div className="grid grid-cols-3 gap-3">
        {slots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            onClick={() => onSelectSlot(slot.id)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 ${
              selectedSlot === slot.id
                ? "border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-200"
                : "border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            <span className="text-2xl">{slot.icon}</span>
            <span className={`text-sm font-semibold ${
              selectedSlot === slot.id ? "text-emerald-700" : "text-gray-800"
            }`}>
              {slot.label}
            </span>
            <span className={`text-xs ${
              selectedSlot === slot.id ? "text-emerald-600" : "text-gray-500"
            }`}>
              {slot.time}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
