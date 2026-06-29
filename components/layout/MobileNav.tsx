'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
  icon: React.ReactNode;
}

const HomeIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const BriefcaseIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>;
const MapIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>;
const ChartIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', roles: ['admin', 'dispatcher'], icon: <HomeIcon /> },
  { label: 'Jobs', href: '/jobs', roles: ['admin', 'dispatcher'], icon: <BriefcaseIcon /> },
  { label: 'My Jobs', href: '/my-jobs', roles: ['technician'], icon: <BriefcaseIcon /> },
  { label: 'Map', href: '/map', roles: ['admin', 'dispatcher'], icon: <MapIcon /> },
  { label: 'My Map', href: '/my-map', roles: ['technician'], icon: <MapIcon /> },
  { label: 'Analytics', href: '/analytics', roles: ['admin', 'dispatcher'], icon: <ChartIcon /> },
];

export function MobileNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const filtered = navItems.filter((n) => n.roles.includes(role));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-bg-secondary border-t border-border-dark">
      <div className="flex">
        {filtered.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors',
                isActive ? 'text-accent-blue' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
