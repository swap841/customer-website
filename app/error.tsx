"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-500 mb-4">{error.message || "An unexpected error occurred"}</p>
      <button onClick={reset} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium">
        Try again
      </button>
    </div>
  );
}
