import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [Google, GitHub],
  callbacks: {
    async session({ session, token }) {
      if (token?.provider) {
        session.user.provider = token.provider;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider; // Simpan provider di token JWT
      }
      return token;
    },
  },
});
