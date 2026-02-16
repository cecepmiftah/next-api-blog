import Link from "next/link";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import Post from "@/models/Post";
import User from "@/models/User";
import {
  FaPen,
  FaHeart,
  FaComment,
  FaUser,
  FaClock,
  FaArrowRight,
  FaFire,
  FaNewspaper,
  FaRocket,
} from "react-icons/fa";
import { MdExplore, MdTrendingUp } from "react-icons/md";
import { fetchPosts } from "@/lib/posts-api";

export default async function Home() {
  const session = await auth();
  let popularPosts = [];

  // Ambil posts populer (berdasarkan likes)
  try {
    const queryParams = new URLSearchParams({
      category: "all",
      status: "published",
      sortBy: "likes",
    });
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts?${queryParams}`,
      {
        credentials: "include",
      },
    );

    if (response.ok) {
      const data = await response.json();
      popularPosts = data.data;
    }
  } catch (error) {
    console.error("Failed to fetch popular posts:", error);
  }

  // Ambil total users
  const totalUsers = 300;
  const totalPosts = 1000;
  // const totalUsers = await User.estimatedDocumentCount();
  // const totalPosts = await Post.estimatedDocumentCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 md:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <FaRocket className="text-purple-400" />
              <span className="text-sm text-slate-300">
                Share Your Stories with the World
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AnyWriting
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Where words come to life. Share your thoughts, stories, and ideas
              with a community of passionate writers.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {totalPosts}+
                </div>
                <div className="text-sm text-slate-400">Stories Published</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {totalUsers}+
                </div>
                <div className="text-sm text-slate-400">Active Writers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-sm text-slate-400">Writing Freedom</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <>
                  <Link
                    href="/posts/new"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <FaPen />
                    Start Writing
                  </Link>
                  <Link
                    href="/profile"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 border border-white/20"
                  >
                    <FaUser />
                    My Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/api/auth/signin"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Get Started
                    <FaArrowRight />
                  </Link>
                  <Link
                    href="#explore"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 border border-white/20"
                  >
                    <MdExplore />
                    Explore Stories
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Why Write with Us?
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 hover:border-blue-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaPen className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Easy Writing
              </h3>
              <p className="text-slate-400">
                Powerful editor with Markdown support. Write and format your
                stories effortlessly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaHeart className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Engage & Connect
              </h3>
              <p className="text-slate-400">
                Like, comment, and interact with other writers. Build your
                community.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 hover:border-pink-500/50 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaNewspaper className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Discover Stories
              </h3>
              <p className="text-slate-400">
                Explore diverse topics and find inspiration from talented
                writers worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      {/* <section id="explore" className="px-4 py-16">
        <div div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Recent Stories
                </span>
              </h2>
              <p className="text-slate-400 text-lg">
                Fresh from our community of writers
              </p>
            </div>
            <Link
              href="/posts"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group"
            >
              View All Posts
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => <PostCard key={post._id} post={post} />)
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold mb-2 text-white">
                  No Posts Yet
                </h3>
                <p className="text-slate-400">
                  Be the first to share your story!
                </p>
              </div>
            )}
          </div>
        </div>
      </section> */}

      {/* Popular Posts Section */}
      {popularPosts?.length > 0 && (
        <section className="px-4 py-16 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <FaFire className="text-3xl text-orange-400" />
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Popular Now
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularPosts.map((post) => (
                <PopularPostCard key={post._id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl border border-white/10 p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ready to Share Your Story?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of writers who are already sharing their thoughts
              with the world.
            </p>
            {session ? (
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <FaPen />
                Start Writing Now
              </Link>
            ) : (
              <Link
                href="/api/auth/signin"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Get Started Today
                <FaArrowRight />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 text-sm">
            © 2024 AnyWriting. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link
              href="/about"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Post Card Component
function PostCard({ post }) {
  return (
    <Link href={`/posts/${post._id}`}>
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all duration-300 group h-full">
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          {post.author?.image ? (
            <img
              src={post.author.image}
              alt={post.author.name}
              className="w-10 h-10 rounded-full border-2 border-slate-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              <FaUser className="text-slate-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-white text-sm">
              {post.author?.name || "Anonymous"}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FaClock />
              <span>
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Post Title */}
        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Post Excerpt */}
        {/* <p className="text-slate-400 mb-4 line-clamp-3">
          {post.content?.substring(0, 150)}...
        </p> */}

        {/* Post Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-slate-500">
            <FaHeart className="text-red-400" />
            <span>{post.likes?.length || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <FaComment className="text-blue-400" />
            <span>{post.comments?.length || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Popular Post Card
function PopularPostCard({ post }) {
  return (
    <Link href={`/posts/${post._id}`}>
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-orange-500/50 transition-all duration-300 group">
        <div className="flex items-start gap-4">
          {/* Author Avatar */}
          {post.author?.image ? (
            <img
              src={post.author.image}
              alt={post.author.name}
              className="w-12 h-12 rounded-full border-2 border-slate-700 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <FaUser className="text-slate-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-lg font-bold mb-2 text-white group-hover:text-orange-400 transition-colors line-clamp-2">
              {post.title}
            </h3>

            {/* Author and Stats */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-slate-400">
                {post.author?.name || "Anonymous"}
              </span>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1 text-slate-500">
                <FaHeart className="text-red-400" />
                <span>{post.likes?.length || 0}</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1 text-slate-500">
                <FaComment className="text-blue-400" />
                <span>{post.comments?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
