export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200 ${className}`}
      aria-hidden="true"
    />
  );
}

/** Fallback cho các section bọc Suspense ở trang chủ. */
export function SectionSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Skeleton className="mx-auto mb-8 h-8 w-64" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}
