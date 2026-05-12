export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 border-4 border-[var(--primary)]/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-[var(--primary)] rounded-full animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-xl font-bold text-[var(--foreground)] animate-pulse">جارٍ التحميل...</p>
          <p className="text-sm text-[var(--muted)]">Loading...</p>
        </div>
      </div>
    </div>
  );
}
