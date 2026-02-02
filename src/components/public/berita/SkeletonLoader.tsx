export default function SkeletonLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm animate-pulse"
        >
          <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-800" />
          <div className="p-5 flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="h-6 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-6 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded mt-2" />
            <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
