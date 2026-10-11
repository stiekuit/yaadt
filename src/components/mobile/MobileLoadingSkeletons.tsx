import { Skeleton } from '@/components/ui/skeleton';

export const ChatMessageSkeleton = () => (
  <div className="flex gap-3 px-4 py-2">
    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-16 w-full max-w-[280px]" />
    </div>
  </div>
);

export const TicketCardSkeleton = () => (
  <div className="bg-card rounded-xl border border-border p-4 space-y-3">
    <div className="flex items-start justify-between">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="flex items-center gap-2 pt-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

export const TicketListSkeleton = () => (
  <div className="space-y-3 p-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <TicketCardSkeleton key={i} />
    ))}
  </div>
);

export const MobileLoadingSkeleton = () => (
  <div className="h-screen-safe flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);
