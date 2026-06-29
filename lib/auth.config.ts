import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@/types';

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  secret: process.env['NEXTAUTH_SECRET'],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [],
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
  },
};
