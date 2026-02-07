"use client";
import { signOut } from "next-auth/react";
import { FaSignOutAlt } from "react-icons/fa";

export default function SignOutBtn() {
  return (
    <div className="mt-10 pt-8 border-t border-slate-700/50">
      <button
        type="submit"
        className="group w-full md:w-auto bg-gradient-to-r from-red-600/90 to-rose-600/90 hover:from-red-500 hover:to-rose-500 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center gap-3 mx-auto"
        aria-label="Sign out of your account"
        onClick={() => signOut()}
      >
        <FaSignOutAlt
          className="group-hover:rotate-12 transition-transform duration-300"
          aria-hidden="true"
        />
        <span>Sign Out</span>
      </button>
      <p className="text-center text-slate-400 text-sm mt-3">
        You'll be redirected to the home page after signing out
      </p>
    </div>
  );
}
