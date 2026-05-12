import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center space-y-6 px-4">
        <h1 className="text-9xl font-bold text-[var(--primary)] animate-bounce">404</h1>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-[var(--foreground)]">الصفحة غير موجودة</h2>
          <h2 className="text-2xl font-medium text-[var(--muted)]">Page Not Found</h2>
        </div>
        <p className="text-[var(--muted)] max-w-md mx-auto">
          عذراً، الصفحة التي تبحث عنها قد تكون حُذفت أو غير موجودة حالياً.
          <br />
          Sorry, the page you are looking for might have been removed or does not exist.
        </p>
        <div className="pt-6">
          <Link 
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white shadow transition-colors hover:bg-[var(--primary-dark)]"
          >
            العودة للرئيسية / Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
