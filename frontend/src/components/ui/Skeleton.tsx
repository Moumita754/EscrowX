export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`skeleton ${className}`} />
);

export const CardSkeleton = () => (
  <div className="card space-y-4 p-6">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-2/3" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center gap-4 border-b border-white/5 px-4 py-4">
    <Skeleton className="h-4 w-12" />
    <Skeleton className="h-4 flex-1" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-6 w-20 rounded-full" />
  </div>
);
