import { auth } from "@/auth";
import SignOutBtn from "@/components/SignOutBtn";
import { MdEmail, MdAccountCircle, MdEdit } from "react-icons/md";
import { FaUserFriends, FaHeart } from "react-icons/fa";
import Link from "next/link";
import UserPosts from "@/components/posts/UserPost";
import User from "@/models/User";
import connectDB from "@/lib/mongoose";

export default async function Profile({ params, searchParams }) {
  const session = await auth();
  const { id } = await params;

  // if (!session) {
  //   redirect("/api/auth/signin");
  // }

  await connectDB();

  // Ambil data user saat ini
  let currentUser;
  if (session) {
    currentUser = await User.findOne({ email: session.user.email });
  }

  // Ambil userId dari URL jika melihat profile orang lain
  const userId = id || currentUser?._id?.toString();

  // Cek apakah user melihat profile sendiri atau orang lain
  const isOwnProfile = userId === currentUser?._id?.toString();

  // Ambil data user yang dilihat
  const viewedUser = await User.findById(userId).populate({
    path: "posts",
    options: { sort: { createdAt: -1 }, limit: 10 },
  });

  if (!viewedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">User not found</h2>
          <a href="/" className="text-blue-400 hover:text-blue-300">
            Return to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {isOwnProfile ? "Your Profile" : "User Profile"}
          </h1>
          <p className="text-slate-400 text-lg">
            {isOwnProfile
              ? "Manage your account and content"
              : `Viewing ${viewedUser.name}'s profile`}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden sticky top-8">
              {/* Profile Header */}
              <div className="p-8 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-900/80">
                <div className="flex flex-col items-center">
                  {/* Avatar */}
                  <div className="relative mb-6">
                    {viewedUser.image ? (
                      <img
                        src={viewedUser.image}
                        alt={`Profile picture of ${viewedUser.name}`}
                        className="w-32 h-32 rounded-full border-4 border-slate-700 shadow-2xl"
                        width={128}
                        height={128}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-slate-700 border-4 border-slate-600 flex items-center justify-center shadow-2xl">
                        <MdAccountCircle className="text-6xl text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="text-center w-full">
                    <h2 className="text-2xl font-bold mb-2 truncate">
                      {viewedUser.name}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-slate-300 mb-4">
                      <MdEmail className="text-blue-400" aria-hidden="true" />
                      <p className="truncate" title={viewedUser.email}>
                        {viewedUser.email}
                      </p>
                    </div>

                    {/* Bio */}
                    {viewedUser.bio && (
                      <div className="mb-6">
                        <p className="text-slate-300 text-sm italic">
                          "{viewedUser.bio}"
                        </p>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="flex items-center justify-center gap-2">
                          <FaUserFriends className="text-blue-400" />
                          <div>
                            <p className="text-2xl font-bold">
                              {viewedUser.posts?.length || 0}
                            </p>
                            <p className="text-xs text-slate-400">Posts</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="flex items-center justify-center gap-2">
                          <FaHeart className="text-red-400" />
                          <div>
                            <p className="text-2xl font-bold">
                              {viewedUser.likedPosts?.length || 0}
                            </p>
                            <p className="text-xs text-slate-400">Likes</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Edit Profile Button (only for own profile) */}
                    {isOwnProfile && (
                      <div className="space-y-4">
                        <Link
                          href="/profile/edit"
                          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300"
                        >
                          <MdEdit />
                          Edit Profile
                        </Link>
                        <SignOutBtn />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Member Since */}
              <div className="p-6">
                <p className="text-sm text-slate-400 text-center">
                  Member since{" "}
                  {new Date(viewedUser.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content - Posts */}
          <div className="lg:col-span-2 space-y-8">
            {/* User's Posts */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    {isOwnProfile ? "Your Posts" : `${viewedUser.name}'s Posts`}
                  </span>
                  <span className="text-sm bg-slate-700 px-3 py-1 rounded-full">
                    {viewedUser.posts?.length || 0}
                  </span>
                </h3>
              </div>
              <div className="p-6">
                <UserPosts userId={viewedUser._id} />
              </div>
            </div>

            {/* Liked Posts (Only shown for own profile) */}
            {/* {isOwnProfile && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-700/50">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <FaHeart className="text-red-400" />
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                      Your Liked Posts
                    </span>
                    <span className="text-sm bg-slate-700 px-3 py-1 rounded-full">
                      Private
                    </span>
                  </h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Only you can see this section
                  </p>
                </div>
                <div className="p-6">
                  <UserLikedPosts userId={viewedUser._id} />
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
