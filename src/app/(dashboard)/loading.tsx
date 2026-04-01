export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      {/* Welcome skeleton */}
      <div className="rounded-2xl p-6 sm:p-8 mb-6 bg-white/5">
        <div className="h-6 w-40 bg-white/10 rounded mb-2" />
        <div className="h-4 w-64 bg-white/5 rounded" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl p-4 bg-white/5">
            <div className="h-3 w-16 bg-white/10 rounded mb-3" />
            <div className="h-8 w-10 bg-white/10 rounded" />
          </div>
        ))}
      </div>

      {/* Activity skeleton */}
      <div className="rounded-xl p-4 bg-white/5 mb-6">
        <div className="h-4 w-20 bg-white/10 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10" />
              <div className="flex-1">
                <div className="h-3 bg-white/10 rounded w-3/4" />
              </div>
              <div className="h-3 w-8 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Monitors skeleton */}
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl p-4 bg-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/10" />
            <div className="flex-1">
              <div className="h-4 bg-white/10 rounded w-48 mb-1" />
              <div className="h-3 bg-white/5 rounded w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
