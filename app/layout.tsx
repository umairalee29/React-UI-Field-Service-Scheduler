import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from '@/components/providers/SessionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'DispatchIQ — Field Service Scheduler',
  description: 'Real-time field service scheduling and dispatch management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg-primary text-text-primary font-body antialiased">
        <SessionProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a2235',
                color: '#f1f5f9',
                border: '1px solid #1e293b',
                borderRadius: '10px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#1a2235' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#1a2235' } },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
