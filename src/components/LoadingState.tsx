export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-[16/9] bg-surface-elevated" />
          <div className="p-4 space-y-2">
            <div className="h-3 w-24 bg-surface-elevated rounded" />
            <div className="h-4 w-full bg-surface-elevated rounded" />
            <div className="h-4 w-4/5 bg-surface-elevated rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
      <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
