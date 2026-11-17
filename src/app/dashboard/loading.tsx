export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-48 animate-pulse rounded-lg bg-white/6" />
      <div className="h-3 w-72 animate-pulse rounded bg-white/4" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card h-28 animate-pulse bg-white/[0.03]" />
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">
        <div className="card h-80 animate-pulse bg-white/[0.03]" />
        <div className="card h-80 animate-pulse bg-white/[0.03]" />
      </div>
      <div className="card h-64 animate-pulse bg-white/[0.03]" />
    </div>
  );
}
