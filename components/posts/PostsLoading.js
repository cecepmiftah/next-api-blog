const PostsLoading = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden animate-pulse"
        >
          <div className="h-48 bg-slate-700"></div>
          <div className="p-5 space-y-4">
            <div className="h-4 bg-slate-700 rounded w-1/4"></div>
            <div className="h-6 bg-slate-700 rounded"></div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-700 rounded"></div>
              <div className="h-3 bg-slate-700 rounded w-5/6"></div>
              <div className="h-3 bg-slate-700 rounded w-4/6"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-700"></div>
              <div className="space-y-2 flex-1">
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                <div className="h-2 bg-slate-700 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostsLoading;
