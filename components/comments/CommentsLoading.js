const CommentsLoading = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-700 rounded-xl"></div>
          <div>
            <div className="h-6 w-24 bg-slate-700 rounded mb-2"></div>
            <div className="h-4 w-32 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>

      {/* Comment Form Skeleton */}
      <div className="bg-slate-800/30 rounded-xl p-6">
        <div className="h-6 w-32 bg-slate-700 rounded mb-4"></div>
        <div className="h-32 bg-slate-700 rounded mb-4"></div>
        <div className="h-10 bg-slate-700 rounded"></div>
      </div>

      {/* Comment Items Skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-800/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 w-24 bg-slate-700 rounded mb-2"></div>
              <div className="h-3 w-16 bg-slate-700 rounded"></div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-700 rounded w-5/6"></div>
            <div className="h-3 bg-slate-700 rounded w-4/6"></div>
          </div>
          <div className="h-6 w-20 bg-slate-700 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export default CommentsLoading;
