"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FaGoogle,
  FaGithub,
  FaFacebook,
  FaArrowRight,
  FaShieldAlt,
  FaLock,
  FaUserCheck,
} from "react-icons/fa";
import { MdSecurity, MdEmail } from "react-icons/md";

export default function LoginButtons() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(null);
  const [error, setError] = useState(null);

  const handleSignIn = async (provider) => {
    try {
      setIsLoading(provider);
      setError(null);

      const result = await signIn(provider, {
        callbackUrl: "/profile",
        redirect: false,
      });

      if (result?.error) {
        setError(`Failed to sign in with ${provider}. Please try again.`);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(null);
    }
  };

  const providers = [
    {
      id: "google",
      name: "Google",
      icon: FaGoogle,
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-600/10 hover:bg-red-600/20",
      borderColor: "border-red-500/30 hover:border-red-500/50",
      textColor: "text-red-400",
      description: "Sign in with your Google account",
    },
    {
      id: "github",
      name: "GitHub",
      icon: FaGithub,
      color: "from-slate-800 to-slate-700",
      bgColor: "bg-slate-800/10 hover:bg-slate-800/20",
      borderColor: "border-slate-700/30 hover:border-slate-700/50",
      textColor: "text-slate-300",
      description: "Sign in with your GitHub account",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: FaFacebook,
      color: "from-blue-600 to-blue-500",
      bgColor: "bg-blue-600/10 hover:bg-blue-600/20",
      borderColor: "border-blue-500/30 hover:border-blue-500/50",
      textColor: "text-blue-400",
      description: "Sign in with your Facebook account",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 animate-fade-in">
      <div className="max-w-4xl w-full mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-slate-700/50 mb-6">
            <FaLock className="text-4xl text-blue-400" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-2">
            Secure authentication for your account
          </p>

          <div className="flex items-center justify-center gap-6 mt-8 text-slate-500">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-green-400" />
              <span className="text-sm">Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <MdSecurity className="text-blue-400" />
              <span className="text-sm">Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUserCheck className="text-purple-400" />
              <span className="text-sm">Verified</span>
            </div>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden max-w-2xl mx-auto">
          <div className="p-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">
                Choose your sign-in method
              </h2>
              <p className="text-slate-400">
                Select one of the providers below to continue securely
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 animate-shake"
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-lg">!</span>
                  </div>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Provider Buttons */}
            <div className="space-y-6">
              {providers.map((provider) => {
                const Icon = provider.icon;
                const isProviderLoading = isLoading === provider.id;

                return (
                  <button
                    key={provider.id}
                    onClick={() => handleSignIn(provider.id)}
                    disabled={isLoading !== null}
                    className={`w-full ${provider.bgColor} border ${provider.borderColor} rounded-2xl p-6 flex items-center justify-between group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                    aria-label={`Sign in with ${provider.name}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`relative w-14 h-14 rounded-xl md:bg-gradient-to-br ${provider.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="text-2xl text-white" />

                        {/* Loading Spinner */}
                        {isProviderLoading && (
                          <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      <div className="text-left">
                        <h3
                          className={`text-xl font-bold ${provider.textColor}`}
                        >
                          {provider.name}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                          {provider.description}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`p-3 rounded-full ${provider.bgColor} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <FaArrowRight
                        className={`text-lg ${provider.textColor} opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="flex items-center my-10">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-700/50" />
              <span className="mx-4 text-slate-500 text-sm">OR</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-700/50" />
            </div>

            {/* Additional Info */}
            <div className="text-center space-y-4">
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <MdEmail className="text-2xl text-blue-400" />
                  <h3 className="text-lg font-semibold">
                    Need help signing in?
                  </h3>
                </div>
                <p className="text-slate-400 text-sm">
                  If you're having trouble accessing your account, make sure
                  you're using the correct email address associated with your
                  provider.
                </p>
              </div>

              <p className="text-slate-500 text-sm pt-6 border-t border-slate-700/30">
                By signing in, you agree to our{" "}
                <a
                  href="/terms"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>
            © {new Date().getFullYear()} Your App Name. All rights reserved.
          </p>
          <p className="mt-2">Powered by Auth.js for secure authentication</p>
        </footer>
      </div>
    </div>
  );
}
