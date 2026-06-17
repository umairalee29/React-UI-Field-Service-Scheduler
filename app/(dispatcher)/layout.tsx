import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileNav } from '@/components/layout/MobileNav';
import type { UserRole } from '@/types';

export default async function DispatcherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role === 'technician') redirect('/my-jobs');

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: session.user.role as UserRole,
  };

  return (
    <div className="flex h-screen bg-bg-primary">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen overflow-hidden">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav role={user.role} />
    </div>
  );
}
