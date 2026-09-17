import React from "react";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#E8EDF1] ${className}`} />;
}

export function AdminPageSkeleton() {
  return (
    <div className="space-y-8" aria-label="Loading admin data" aria-busy="true">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-8 w-56 sm:w-72" />
          <SkeletonBlock className="h-3 w-72 max-w-full sm:w-96" />
        </div>
        <SkeletonBlock className="h-10 w-36" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#C2CBD2]/30 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-3">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-7 w-24" />
              </div>
              <SkeletonBlock className="h-10 w-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#C2CBD2]/30 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-[#C2CBD2]/25 px-5 py-4 sm:px-6">
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="h-3 w-52" />
          </div>
          <SkeletonBlock className="h-9 w-28" />
        </div>

        <div className="divide-y divide-[#C2CBD2]/20">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[1.2fr_.8fr_.7fr] gap-4 px-5 py-4 sm:grid-cols-[1.3fr_1fr_.8fr_.7fr] sm:px-6"
            >
              <SkeletonBlock className="h-4 w-full max-w-52" />
              <SkeletonBlock className="hidden h-4 w-full max-w-36 sm:block" />
              <SkeletonBlock className="h-4 w-full max-w-28" />
              <SkeletonBlock className="ml-auto h-7 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
