export default function Skeleton({ className = '', count = 1 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className={`skeleton ${className}`} />
  ));
}

export function SkeletonCard() {
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-11 h-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4 rounded-lg" />
          <div className="skeleton h-3 w-1/2 rounded-lg" />
        </div>
      </div>
      <div className="skeleton h-3 w-full rounded-lg" />
      <div className="skeleton h-3 w-4/5 rounded-lg" />
      <div className="flex gap-2">
        <div className="skeleton h-7 w-16 rounded-lg" />
        <div className="skeleton h-7 w-16 rounded-lg" />
        <div className="skeleton h-7 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <div className="skeleton h-7 w-64 rounded-lg" />
        <div className="skeleton h-4 w-48 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card">
            <div className="flex items-center gap-4">
              <div className="skeleton w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-6 w-16 rounded-lg" />
                <div className="skeleton h-3 w-28 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
