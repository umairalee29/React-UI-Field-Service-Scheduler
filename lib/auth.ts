import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { connectDB } from './db';
import type { UserRole } from '@/types';

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  secret: process.env['NEXTAUTH_SECRET'],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();

        const { default: User } = await import('@/models/User');
        const user = await User.findOne({ email: credentials.email, isActive: true });
        if (!user) return null;

        const isValid = await user.comparePassword(credentials.password as string);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          image: user.avatar ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token['id'] = user.id;
        token['role'] = (user as { id: string; role: UserRole }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token['id'] as string;
        session.user.role = token['role'] as UserRole;
      }
      return session;
    },
    async authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const path = nextUrl.pathname;

      if (!isLoggedIn) {
        if (path.startsWith('/api/') && !path.startsWith('/api/auth')) {
          return false;
        }
        return true;
      }

      const role = session.user.role as UserRole;

      if (path.startsWith('/admin') && role !== 'admin') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      if (path.startsWith('/my-jobs') && role !== 'technician' && role !== 'admin') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      return true;
    },
  },
});
