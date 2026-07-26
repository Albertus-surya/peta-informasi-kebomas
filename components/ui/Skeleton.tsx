import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-ink-300/60", className)}
    />
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-ink-100">
      <Skeleton className="h-full w-full" />
    </div>
  );
}
