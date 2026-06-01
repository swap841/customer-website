'use client';

import { Mic } from 'lucide-react';

export function VoiceSearch({ onResult }: { onResult: (text: string) => void }) {
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
    };

    recognition.start();
  };

  return (
    <button
      onClick={startVoiceSearch}
      className="p-2 rounded-full hover:bg-slate-100 transition-colors"
      aria-label="Voice Search"
    >
      <Mic className="w-5 h-5 text-slate-600" />
    </button>
  );
}
