"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PostsHeader from "@/components/posts/PostsHeader";
import PostsGrid from "@/components/posts/PostsGrid";
import PostsList from "@/components/posts/PostsList";
import PostsFilters from "@/components/posts/PostsFilters";
import PostsLoading from "@/components/posts/PostsLoading";
import PostsEmpty from "@/components/posts/PostsEmpty";
import { fetchPosts } from "@/lib/posts-api";

export default function PostsPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    status: "published",
    category: "all",
    sortBy: "newest",
    search: "",
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
  });

  // Fetch posts based on filters
  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        ...filters,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      });

      // Add author filter if user is logged in
      if (session && filters.status === "my") {
        queryParams.set("authorId", session.user.id);
      }

      const result = await fetchPosts(queryParams.toString());
      if (result.success) {
        setPosts(result.data);
        setPagination(
          result.pagination || {
            page: filters.page,
            total: result.data.length,
            pages: 1,
          },
        );
      } else {
        throw new Error(result.error || "Failed to load posts");
      }
    } catch (err) {
      console.error("Error loading posts:", err);
      setError(err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadPosts();
  }, [filters, session]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page on filter change
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle post deletion
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        // Remove deleted post from state
        setPosts((prev) => prev.filter((post) => post._id !== postId));

        // Show success message
        alert("Post deleted successfully!");

        // Reload posts if needed
        if (posts.length <= 1 && filters.page > 1) {
          handlePageChange(filters.page - 1);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert("Failed to delete post: " + err.message);
    }
  };

  // Handle post status change
  const handleStatusChange = async (postId, newStatus) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });

      const result = await response.json();

      if (result.success) {
        // Update post in state
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, status: newStatus } : post,
          ),
        );

        // Show success message
        alert(`Post ${newStatus} successfully!`);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert("Failed to update post status: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <PostsHeader
          totalPosts={pagination.total}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={loadPosts}
          isLoading={loading}
        />

        {/* Filters */}
        <PostsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          user={session?.user}
        />

        {/* Content */}
        <div className="mt-8">
          {loading ? (
            <PostsLoading />
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">Error: {error}</div>
              <button
                onClick={loadPosts}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90"
              >
                Try Again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <PostsEmpty filters={filters} />
          ) : viewMode === "grid" ? (
            <PostsGrid
              posts={posts}
              onDelete={handleDeletePost}
              onStatusChange={handleStatusChange}
              currentUser={session?.user}
            />
          ) : (
            <PostsList
              posts={posts}
              onDelete={handleDeletePost}
              onStatusChange={handleStatusChange}
              currentUser={session?.user}
            />
          )}
        </div>

        {/* Pagination */}
        {!loading && posts.length > 0 && pagination.pages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-l-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 border border-slate-700 ${
                      pagination.page === pageNum
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-slate-800 hover:bg-slate-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-r-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        {!loading && posts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-700/50 text-center text-slate-400 text-sm">
            <p>
              Showing {posts.length} of {pagination.total} posts • Page{" "}
              {pagination.page} of {pagination.pages}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
