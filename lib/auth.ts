import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { connectDB } from './db';
import { authConfig } from './auth.config';
import type { UserRole } from '@/types';

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
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
});
