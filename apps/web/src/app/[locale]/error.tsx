'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="text-center space-y-6 max-w-lg">
        <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-[var(--foreground)]">حدث خطأ غير متوقع</h2>
          <h2 className="text-2xl font-medium text-[var(--muted)]">An unexpected error occurred</h2>
        </div>
        <p className="text-[var(--muted)]">
          نحن نعتذر عن هذا الخلل. يرجى محاولة إعادة تحميل الصفحة.
          <br />
          We apologize for the inconvenience. Please try refreshing the page.
        </p>
        <div className="pt-6">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-[var(--primary-dark)]"
          >
            حاول مرة أخرى / Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
