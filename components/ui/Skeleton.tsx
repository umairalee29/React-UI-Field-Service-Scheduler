import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-border-dark rounded', className)} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-bg-card border border-border-dark rounded-xl p-4 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border-dark">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}

export function SkeletonCalendar() {
  return (
    <div className="bg-bg-card rounded-xl p-4 border border-border-dark space-y-3">
      {/* Toolbar: nav buttons left, title centre, view switcher right */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-7 w-8 rounded-md" />
          <Skeleton className="h-7 w-8 rounded-md" />
          <Skeleton className="h-7 w-14 rounded-md" />
        </div>
        <Skeleton className="h-5 w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-12 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>
      </div>

      {/* Day-header row */}
      <div className="grid grid-cols-8 gap-px">
        <div />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 rounded-md" />
        ))}
      </div>

      {/* Hour slots */}
      <div className="space-y-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="grid grid-cols-8 gap-px">
            <Skeleton className="h-10 w-10 rounded" />
            {Array.from({ length: 7 }).map((_, j) => (
              <div
                key={j}
                className="h-10 border-t border-border-dark"
                style={{ opacity: i === 0 ? 1 : undefined }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonKanban() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="min-w-[280px] bg-bg-card rounded-xl p-4 space-y-3">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 3 }).map((_, j) => (
            <SkeletonCard key={j} />
          ))}
        </div>
      ))}
    </div>
  );
}
