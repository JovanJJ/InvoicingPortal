import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/lib/connectdb";
import Users from "@/lib/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      await connectDB();

      const existingUser = await Users.findOne({ email: profile.email });

      if (!existingUser) {
        await Users.create({
          email: profile.email,
          name: profile.name,
          avatar: profile.picture,
          googleId: profile.sub,
        });
      }

      return true;
    },

    async jwt({ token, profile }) {
      if (profile) {
        await connectDB();
        const dbUser = await Users.findOne({ email: profile.email });
        token.id = dbUser._id.toString();
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
};

const handler = NextAuth(authOptions); // 👈 this was missing
export { handler as GET, handler as POST };