import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import type { NextAuthOptions } from "next-auth";
import credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    credentials({
      name: "Credentials",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials?.email }).select(
          "+password"
        );

        if (!user) throw new Error("Invalid email or password");

        const passwordMatch = await bcrypt.compare(
          credentials!.password,
          user.password
        );

        if (!passwordMatch) throw new Error("Invalid email or password");

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        await connectDB();
        const existingUser = await User.findOne({ email: profile?.email });

        if (existingUser) {
          if (!existingUser.googleId) {
            existingUser.googleId = account.providerAccountId;
            await existingUser.save();
          }
          return true;
        }

        const newUser = new User({
          name: profile?.name,
          email: profile?.email,
          avatarUrl: (profile as any)?.picture,
          googleId: account.providerAccountId,
        });

        await newUser.save();
        return true;
      }
      return true;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.avatarUrl = token.avatarUrl as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
};
