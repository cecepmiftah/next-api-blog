import { auth } from "@/auth";
import SignOutBtn from "@/components/SignOutBtn";
import { FaGithub, FaGoogle, FaFacebook, FaSignOutAlt } from "react-icons/fa";
import { MdEmail, MdAccountCircle } from "react-icons/md";

export default async function Profile() {
  const session = await auth();
  console.log("Session Data:", session);

  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-10 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              User Profile
            </h1>
            <p className="text-slate-400 text-lg">Your account information</p>
          </header>

          {/* Profile Card */}
          <main className="max-w-2xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden animate-slide-up">
              {/* Profile Header */}
              <div className="p-8 md:p-10 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-900/80">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Avatar */}
                  <div className="relative group">
                    {session.user.image ? (
                      <div className="relative">
                        <img
                          src={session.user.image}
                          alt={`Profile picture of ${session.user.name}`}
                          className="w-36 h-36 rounded-full border-4 border-slate-700 shadow-2xl group-hover:scale-105 transition-transform duration-300"
                          width={144}
                          height={144}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 group-hover:opacity-0 transition-opacity duration-300" />
                      </div>
                    ) : (
                      <div className="w-36 h-36 rounded-full bg-slate-700 border-4 border-slate-600 flex items-center justify-center shadow-2xl">
                        <MdAccountCircle className="text-7xl text-slate-400" />
                      </div>
                    )}
                    {/* <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-slate-900 border border-slate-700 rounded-full px-4 py-1 flex items-center gap-2 shadow-lg">
                        {session.user.provider === "google" ? (
                          <>
                            <FaGoogle
                              className="text-red-400"
                              aria-hidden="true"
                            />
                            <span className="text-sm font-medium">Google</span>
                          </>
                        ) : session.user.provider === "github" ? (
                          <>
                            <FaGithub
                              className="text-slate-100"
                              aria-hidden="true"
                            />
                            <span className="text-sm font-medium">GitHub</span>
                          </>
                        ) : (
                          <>
                            <FaFacebook
                              className="text-blue-400"
                              aria-hidden="true"
                            />
                            <span className="text-sm font-medium">
                              Facebook
                            </span>
                          </>
                        )}
                      </div>
                    </div> */}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">
                      {session.user.name}
                    </h2>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-slate-300 mb-4">
                      <MdEmail className="text-blue-400" aria-hidden="true" />
                      <p
                        className="text-lg truncate"
                        title={session.user.email}
                      >
                        {session.user.email}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-slate-900/70 border border-slate-700 rounded-full px-4 py-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-medium">Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="p-8 md:p-10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Account Details
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-colors duration-300">
                    <p className="text-slate-400 text-sm mb-1">Account Type</p>
                    {/* <p className="font-medium">
                      {session.user.provider.charAt(0).toUpperCase() +
                        session.user.provider.slice(1)}
                    </p> */}
                  </div>

                  <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-colors duration-300">
                    <p className="text-slate-400 text-sm mb-1">
                      Authentication
                    </p>
                    <p className="font-medium">OAuth 2.0</p>
                  </div>
                </div>

                {/* Sign Out Button */}
                <SignOutBtn />
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>Secure authentication provided by Auth.js</p>
          </footer>
        </div>
      </div>
    );
  }

  // Not logged in state
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-md text-center animate-fade-in">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-10 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-slate-700 border-4 border-slate-600 flex items-center justify-center mx-auto mb-6">
            <MdAccountCircle className="text-5xl text-slate-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Access Required</h2>
          <p className="text-slate-300 mb-8">
            You need to sign in to view this page. Please log in with your
            account.
          </p>
          <div className="space-y-4">
            <a
              href="/api/auth/signin"
              className="inline-flex items-center gap-3 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Sign in to your account"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
