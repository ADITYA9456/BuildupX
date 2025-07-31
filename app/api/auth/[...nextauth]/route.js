import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '../../../../lib/db';
import User from '../../../../models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await connectDB();
          
          // Find user by email
          const user = await User.findOne({ email: credentials.email });
          
          // Check if user exists
          if (!user) {
            throw new Error('No user found with this email');
          }
          
          // Check if password is correct
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          
          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }
          
          // Return user object
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            membershipType: user.membershipType,
            membershipStartDate: user.membershipStartDate
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Add user data to JWT token
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.membershipType = user.membershipType;
        token.membershipStartDate = user.membershipStartDate;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user data to session
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
        membershipType: token.membershipType,
        membershipStartDate: token.membershipStartDate
      };
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-fallback-secret-key',
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

