import { auth } from '@/lib/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { auth: session, nextUrl } = req;
  const isLoggedIn = !!session?.user;
  const path = nextUrl.pathname;
  const role = session?.user?.role;

  // Public paths
  if (path === '/login' || path === '/' || path.startsWith('/api/auth')) {
    if (isLoggedIn && path === '/login') {
      const target = role === 'technician' ? '/my-jobs' : '/dashboard';
      return NextResponse.redirect(new URL(target, nextUrl));
    }
    return NextResponse.next();
  }

  // Not logged in → redirect to login
  if (!isLoggedIn) {
    if (path.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Role-based access control
  if (path.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  if (path.startsWith('/my-jobs') && role !== 'technician' && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  if (
    (path.startsWith('/dashboard') ||
      path.startsWith('/jobs') ||
      path.startsWith('/technicians') ||
      path.startsWith('/analytics')) &&
    role === 'technician'
  ) {
    return NextResponse.redirect(new URL('/my-jobs', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
