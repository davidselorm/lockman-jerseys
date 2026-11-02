export default function Loading() {
  return (
    <div className="min-h-screen bg-black py-8 sm:py-12 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Banner Skeleton */}
        <div className="h-44 sm:h-64 rounded-3xl bg-[#0C0C0C] border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-shimmer" />
          <div className="p-6 sm:p-10 space-y-3">
            <div className="h-4 w-32 bg-white/10 rounded-full" />
            <div className="h-8 sm:h-12 w-64 sm:w-96 bg-white/10 rounded-xl" />
            <div className="h-4 w-48 bg-white/5 rounded-full" />
          </div>
        </div>

        {/* Filter Pills Skeleton */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-24 sm:w-28 rounded-full bg-[#0C0C0C] border border-white/5 shrink-0"
            />
          ))}
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl bg-[#0C0C0C] border border-white/5 p-3 sm:p-4 space-y-3 flex flex-col justify-between"
            >
              {/* Image Skeleton */}
              <div className="aspect-square rounded-2xl bg-black/40 border border-white/5" />
              
              {/* Content Skeleton */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-white/10 rounded-full" />
                  <div className="h-3 w-12 bg-white/10 rounded-full" />
                </div>
                <div className="h-4 w-3/4 bg-white/10 rounded-md" />
                <div className="h-5 w-20 bg-white/15 rounded-md" />
              </div>

              {/* Action Skeleton */}
              <div className="h-9 rounded-full bg-white/10" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
