'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Avatar } from '@/components/ui/Avatar';
import { RoleBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const BriefcaseIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
  </svg>
);
const DashboardIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M3 12h18M3 17h18" />
  </svg>
);
const MapIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);
const UsersIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const ChartIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const SettingsIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon />, roles: ['admin', 'dispatcher'] },
  { label: 'Jobs', href: '/jobs', icon: <BriefcaseIcon />, roles: ['admin', 'dispatcher'] },
  { label: 'My Jobs', href: '/my-jobs', icon: <BriefcaseIcon />, roles: ['technician'] },
  { label: 'Live Map', href: '/map', icon: <MapIcon />, roles: ['admin', 'dispatcher', 'technician'] },
  { label: 'Technicians', href: '/technicians', icon: <UsersIcon />, roles: ['admin', 'dispatcher'] },
  { label: 'Analytics', href: '/analytics', icon: <ChartIcon />, roles: ['admin', 'dispatcher'] },
  { label: 'Users', href: '/admin/users', icon: <UsersIcon />, roles: ['admin'] },
  { label: 'Settings', href: '/admin/settings', icon: <SettingsIcon />, roles: ['admin'] },
];

interface SidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null; role: UserRole };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const filteredNav = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-bg-secondary border-r border-border-dark fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border-dark">
        <Link href={user.role === 'technician' ? '/my-jobs' : '/dashboard'} className="flex items-center gap-2">
          <span className="text-accent-blue text-xl">⚡</span>
          <span className="text-lg font-bold text-text-primary font-heading">DispatchIQ</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue border-l-2 border-accent-blue pl-[10px]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-border-dark">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <Avatar name={user.name ?? 'User'} src={user.image ?? undefined} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary truncate">{user.name}</p>
            <RoleBadge role={user.role} className="mt-0.5" />
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-accent-red rounded-lg hover:bg-bg-card transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
