import { FaFilter, FaSearch, FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";

const PostsFilters = ({ filters, onFilterChange, user }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFilterChange({ search: searchInput, page: 1 });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "general", label: "General" },
    { value: "technology", label: "Technology" },
    { value: "design", label: "Design" },
    { value: "business", label: "Business" },
    { value: "education", label: "Education" },
    { value: "health", label: "Health" },
    { value: "entertainment", label: "Entertainment" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "popular", label: "Most Popular" },
    { value: "title-asc", label: "Title A-Z" },
    { value: "title-desc", label: "Title Z-A" },
  ];

  const statusOptions = user
    ? [
        { value: "published", label: "Published" },
        { value: "draft", label: "Drafts" },
        { value: "private", label: "Private" },
        { value: "my", label: "My Posts" },
      ]
    : [{ value: "published", label: "Published" }];

  const handleClearFilters = () => {
    onFilterChange({
      status: "published",
      category: "all",
      sortBy: "newest",
      search: "",
      page: 1,
    });
    setSearchInput("");
  };

  const hasActiveFilters =
    filters.status !== "published" ||
    filters.category !== "all" ||
    filters.sortBy !== "newest" ||
    filters.search !== "";

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts by title or content..."
            className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput("");
                onFilterChange({ search: "", page: 1 });
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-3 border rounded-xl flex items-center gap-2 ${
              showAdvanced || hasActiveFilters
                ? "bg-blue-600/20 border-blue-500/30 text-blue-400"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            <FaFilter />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            )}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white flex items-center gap-2"
            >
              <FaTimes />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Results per page
            </label>
            <select
              value={filters.limit}
              onChange={(e) =>
                onFilterChange({ limit: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="6">6 posts</option>
              <option value="12">12 posts</option>
              <option value="24">24 posts</option>
              <option value="48">48 posts</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="From"
              />
              <input
                type="date"
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="To"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsFilters;
