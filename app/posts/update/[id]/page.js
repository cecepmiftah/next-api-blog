"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function UpdatePost() {
  const params = useParams();
  const { id } = params;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      const res = await fetch(`/api/posts/${id}`);
      const data = await res.json();
      setTitle(data.title);
      setContent(data.content);
    };

    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        throw new Error("Failed to update post");
      }

      toast.success("Post updated successfully!");
      router.push("/");
      router.refresh(); // Refresh the page to show the updated post
    } catch (err) {
      toast.error("Something went wrong");
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-8">Update Post</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-slate-800 p-8 rounded-lg shadow-lg"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-slate-700 text-white px-4 py-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Content
          </label>
          <textarea
            id="content"
            rows="10"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full bg-slate-700 text-white px-4 py-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900"
          >
            {isSubmitting ? "Updating..." : "Update Post"}
          </button>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
}
