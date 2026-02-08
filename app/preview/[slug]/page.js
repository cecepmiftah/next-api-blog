"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import PostHeader from "@/components/posts/single/PostHeader";
import PostContent from "@/components/posts/single/PostContent";
import { FaArrowLeft, FaEye } from "react-icons/fa";

const EditorReadOnly = dynamic(() => import("@/components/EditorReadOnly"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[200px] bg-slate-900 rounded-xl border border-slate-700 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-slate-400 text-sm">Loading preview...</p>
      </div>
    </div>
  ),
});

export default function PreviewPostPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get from localStorage first (for draft preview)
    const previewData = localStorage.getItem("post_preview");

    if (previewData) {
      try {
        const parsedData = JSON.parse(previewData);
        if (parsedData.slug === slug) {
          setPost(parsedData);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error parsing preview data:", error);
      }
    }

    // If not in localStorage, fetch from API
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      const response = await fetch(`/api/posts/${slug}`);
      const result = await response.json();

      if (result.success) {
        setPost(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error loading post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Preview Not Available</h1>
          <p className="text-slate-400 mb-6">
            The post preview could not be loaded.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Preview Banner */}
      <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-b border-yellow-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaEye className="text-yellow-400" />
              <span className="text-yellow-400 font-medium">Preview Mode</span>
              <span className="text-sm text-yellow-500">
                This is how your post will look to readers
              </span>
            </div>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg flex items-center gap-2"
            >
              <FaArrowLeft />
              Back to Editor
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full text-sm font-medium">
                {post.category}
              </span>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium border ${
                  post.status === "published"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : post.status === "draft"
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                }`}
              >
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </span>
            </div>

            <div className="text-sm text-slate-500">
              Preview • Not Published
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl mb-8">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <div className="prose prose-invert max-w-none">
            <EditorReadOnly data={post.content} holder="preview-editor" />
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center">
          <p className="text-yellow-400">
            <strong>Note:</strong> This is a preview. Changes are not saved
            until you publish.
          </p>
        </div>
      </div>
    </div>
  );
}
