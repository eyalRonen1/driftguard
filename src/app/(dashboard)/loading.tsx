function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />;
}

export default function DashboardShellLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 border-r border-gray-200 bg-white p-6">
        <SkeletonBlock className="h-8 w-32" />
        <div className="mt-8 space-y-3">
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
          <SkeletonBlock className="h-10 w-full" />
        </div>
      </aside>

      <main className="lg:ml-64 pt-14 lg:pt-0 p-4 sm:p-6 min-h-screen">
        <div className="space-y-6">
          <div className="space-y-3">
            <SkeletonBlock className="h-8 w-48" />
            <SkeletonBlock className="h-4 w-72" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-gray-200 bg-white p-5">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="mt-3 h-8 w-16" />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
          </div>
        </div>
      </main>
    </div>
  );
}
