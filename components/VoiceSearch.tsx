'use client';

import { Mic } from 'lucide-react';

export function VoiceSearch({ onResult }: { onResult: (text: string) => void }) {
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search not supported in this browser');
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
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
