const PostLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 mb-8">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-slate-700 rounded w-3/4 mb-6"></div>
            <div className="h-6 bg-slate-700 rounded w-1/2 mb-8"></div>
            <div className="flex gap-6">
              <div className="h-4 bg-slate-700 rounded w-24"></div>
              <div className="h-4 bg-slate-700 rounded w-24"></div>
              <div className="h-4 bg-slate-700 rounded w-24"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-8">
              <div className="h-96 bg-slate-700 rounded-2xl"></div>

              <div className="space-y-4">
                <div className="h-4 bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                <div className="h-4 bg-slate-700 rounded w-4/6"></div>
                <div className="h-4 bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              </div>

              <div className="h-32 bg-slate-700 rounded-xl"></div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-8">
              <div className="h-64 bg-slate-700 rounded-xl"></div>
              <div className="h-48 bg-slate-700 rounded-xl"></div>
              <div className="h-56 bg-slate-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostLoading;
