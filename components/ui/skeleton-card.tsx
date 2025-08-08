import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  className?: string;
  variant?: "stats" | "chart" | "table" | "action";
}

export function SkeletonCard({
  className,
  variant = "stats",
  ...props
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm",
        className
      )}
      {...props}
    >
      {variant === "stats" && (
        <>
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-[80px] mb-2" />
          <Skeleton className="h-3 w-[140px] mb-4" />
          <div className="flex items-center mt-2">
            <Skeleton className="h-5 w-[60px] rounded-full" />
          </div>
        </>
      )}
      
      {variant === "chart" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <div className="mt-1 space-y-3">
            <Skeleton className="h-[200px] w-full" />
          </div>
        </>
      )}
      
      {variant === "table" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-[120px]" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </>
      )}
      
      {variant === "action" && (
        <div className="flex flex-col h-full justify-between">
          <div className="mb-4">
            <Skeleton className="h-10 w-10 rounded-full mb-4" />
            <Skeleton className="h-4 w-[100px] mb-2" />
            <Skeleton className="h-3 w-[140px]" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[150px]" />
        </div>
      </div>
      
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonCard variant="stats" />
        <SkeletonCard variant="stats" />
        <SkeletonCard variant="stats" />
        <SkeletonCard variant="stats" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <SkeletonCard variant="action" />
        <SkeletonCard variant="action" />
        <SkeletonCard variant="action" />
        <SkeletonCard variant="action" />
      </div>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <SkeletonCard variant="chart" className="h-[350px]" />
        <SkeletonCard variant="chart" className="h-[350px]" />
      </div>
    </div>
  );
} 