import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * NextAuth Configuration - Google Login Only
 *
 * Admin users defined by email whitelist
 * Only admins get access to /admin panel and controls
 */

// Admin email whitelist
const ADMIN_EMAILS = [
  "leonardo.lech@gmail.com",  // Main admin
  "leo@lbldomain.com",         // Secondary admin
];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow all Google users to sign in
      // Admin status determined by email whitelist
      return true;
    },

    async jwt({ token, user, account }) {
      // Add admin flag to token
      if (user) {
        token.isAdmin = ADMIN_EMAILS.includes(user.email || "");
        token.userId = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      // Add admin flag and userId to session
      if (session.user) {
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.id = token.userId as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/signin',  // Custom sign-in page
    error: '/auth/error',
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
