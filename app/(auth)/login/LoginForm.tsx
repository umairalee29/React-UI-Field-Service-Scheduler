'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@dispatchiq.com', password: 'admin1234' },
  { label: 'Dispatcher', email: 'dispatch@dispatchiq.com', password: 'dispatch1234' },
  { label: 'Technician', email: 'tech1@dispatchiq.com', password: 'tech1234' },
];

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e?: React.FormEvent, overrideEmail?: string, overridePassword?: string) => {
    e?.preventDefault();
    const loginEmail = overrideEmail ?? email;
    const loginPassword = overridePassword ?? password;
    if (!loginEmail || !loginPassword) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        toast.success('Welcome back!');
        router.refresh();
        router.push('/');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    handleLogin(undefined, acc.email, acc.password);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-accent-red">{error}</p>}
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign in
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-dark" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-bg-secondary px-3 text-text-secondary">Demo accounts</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {DEMO_ACCOUNTS.map((acc) => (
          <button
            key={acc.label}
            type="button"
            onClick={() => handleDemo(acc)}
            disabled={loading}
            className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border-dark hover:border-accent-blue hover:bg-accent-blue/5 transition-all text-xs text-text-secondary hover:text-accent-blue disabled:opacity-50"
          >
            <span className="text-lg">
              {acc.label === 'Admin' ? '👑' : acc.label === 'Dispatcher' ? '📋' : '🔧'}
            </span>
            {acc.label}
          </button>
        ))}
      </div>
    </div>
  );
}
