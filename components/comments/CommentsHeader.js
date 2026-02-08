import { FaSort, FaSync, FaComment } from "react-icons/fa";

const CommentsHeader = ({ totalComments, sortBy, onSortChange, onRefresh }) => {
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "popular", label: "Most Popular" },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center">
          <FaComment className="text-blue-400 text-xl" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Comments</h2>
          <p className="text-slate-400">
            {totalComments} {totalComments === 1 ? "comment" : "comments"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none pl-10 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
          title="Refresh comments"
        >
          <FaSync />
        </button>
      </div>
    </div>
  );
};

export default CommentsHeader;
