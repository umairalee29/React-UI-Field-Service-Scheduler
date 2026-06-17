import { LoginForm } from './LoginForm';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Login — DispatchIQ' };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    if (session.user.role === 'technician') redirect('/my-jobs');
    redirect('/dashboard');
  }
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚡</div>
          <h1 className="text-3xl font-bold text-text-primary font-heading">DispatchIQ</h1>
          <p className="text-text-secondary mt-2">Field Service Scheduling Platform</p>
        </div>
        <div className="bg-bg-secondary border border-border-dark rounded-2xl p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
