'use client';

import { Mic } from 'lucide-react';
import { toast } from 'sonner';

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: { results: Array<Array<{ transcript: string }>> }) => void;
  onerror: () => void;
  start: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export function VoiceSearch({ onResult }: { onResult: (text: string) => void }) {
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice search is not supported in this browser');
      return;
    }

    const SpeechRecognitionAPI = (window as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition || (window as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      toast.error('Voice search is not supported in this browser');
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: { results: Array<Array<{ transcript: string }>> }) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = () => {
      toast.error('Voice recognition failed. Please try again.');
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
