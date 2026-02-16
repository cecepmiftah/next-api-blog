import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import { fetchPosts } from "@/lib/posts-api";
import Post from "@/models/Post";
import User from "@/models/User";
import Link from "next/link";
import { FaHeart, FaComment, FaCalendar } from "react-icons/fa";

export default async function UserPosts({ userId }) {
  const session = await auth();

  await connectDB();
  const posts = await Post.find({ authorId: userId })
    .sort({ createdAt: -1 })
    .populate("authorId", "name image");

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="text-slate-400 text-6xl mb-4">📝</div>
        <h3 className="text-xl font-bold mb-2">No posts yet</h3>
        <p className="text-slate-400">This user hasn't created any posts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-5 hover:border-slate-600/50 transition-colors duration-300"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <Link href={`/posts/${post.slug}`}>
                <h4 className="text-lg font-bold hover:text-blue-400 transition-colors">
                  {post.title}
                </h4>
              </Link>
              <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                <div className="flex items-center gap-1">
                  <FaCalendar className="text-xs" />
                  <span>
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <FaHeart className="text-red-400 text-xs" />
                    <span>{post.likes?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            {post.author?.image && (
              <img
                src={post.author.image}
                alt={post.author.name}
                className="w-10 h-10 rounded-full border border-slate-600"
              />
            )}
          </div>

          <p className="text-slate-300 line-clamp-3">
            {/* {post.content.substring(0, 200)}... */}
          </p>

          <div className="mt-4">
            <Link
              href={`/posts/${post.slug}`}
              className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              Read more →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
