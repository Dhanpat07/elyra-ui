import { cn } from "@/lib/utils";

// Base skeleton with shimmer animation
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/50",
        className
      )}
      {...props}
    />
  );
}

// Card skeleton for billing plans, stats, etc.
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-card p-6 space-y-4", className)}>
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-10 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <Skeleton className="h-10 w-full mt-4" />
    </div>
  );
}

// Plan card skeleton for pricing
export function PlanCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-12 w-28" />
      <div className="space-y-3 py-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-10" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>
      <div className="border-t border-border/50 pt-4 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
      <Skeleton className="h-11 w-full mt-4 rounded-xl" />
    </div>
  );
}

// Usage stat skeleton
export function UsageStatSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

// Invoice row skeleton
export function InvoiceRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/30">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-5 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      <div className="bg-muted/30 p-4 flex gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16 ml-auto" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <InvoiceRowSkeleton key={i} />
      ))}
    </div>
  );
}

// Full billing page skeleton
export function BillingPageSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Current plan banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-purple/20 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-lg" />
        ))}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <PlanCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Dashboard stats skeleton
export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
      
      {/* Chart area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
