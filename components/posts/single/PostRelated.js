import Link from "next/link";
import { FaCalendar, FaEye, FaArrowRight } from "react-icons/fa";

const PostRelated = ({ posts }) => {
  if (!posts || posts.length === 0) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
      <h3 className="text-xl font-bold mb-6">Related Posts</h3>

      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/posts/${post.slug}`}
            className="group block p-4 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 rounded-xl transition-all"
          >
            <div className="flex items-start gap-4">
              {post.featuredImage && (
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="flex-1">
                <h4 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h4>

                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <FaCalendar size={12} />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <FaEye size={12} />
                    <span>{post.views || 0}</span>
                  </div>
                </div>
              </div>

              <FaArrowRight className="text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <Link
          href="/posts"
          className="text-center block text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          View all posts →
        </Link>
      </div>
    </div>
  );
};

export default PostRelated;
