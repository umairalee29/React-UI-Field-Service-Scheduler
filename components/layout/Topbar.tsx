'use client';

import { usePathname } from 'next/navigation';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import type { UserRole } from '@/types';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/jobs': 'Jobs',
  '/jobs/new': 'New Job',
  '/map': 'Live Map',
  '/technicians': 'Technicians',
  '/analytics': 'Analytics',
  '/my-jobs': 'My Jobs',
  '/admin/users': 'User Management',
  '/admin/settings': 'Settings',
};

function getTitle(pathname: string): string {
  if (pathname.startsWith('/jobs/') && pathname !== '/jobs/new') return 'Job Details';
  if (pathname.startsWith('/my-jobs/')) return 'Job Details';
  return PAGE_TITLES[pathname] ?? 'DispatchIQ';
}

interface TopbarProps {
  user: { name?: string | null; role: UserRole };
}

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="sticky top-0 z-20 bg-bg-secondary/80 backdrop-blur border-b border-border-dark px-6 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-text-primary font-heading">{title}</h1>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <div className="text-sm text-text-secondary hidden sm:block">
          {user.name}
        </div>
      </div>
    </header>
  );
}
