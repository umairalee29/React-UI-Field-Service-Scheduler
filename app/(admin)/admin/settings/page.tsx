import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

export const metadata = { title: 'Settings — DispatchIQ' };

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-bold text-text-primary font-heading">Settings</h2>

      <Card>
        <CardHeader><CardTitle>Application Info</CardTitle></CardHeader>
        <div className="space-y-2 text-sm text-text-secondary">
          <div className="flex justify-between"><span>Version</span><span className="font-mono text-text-primary">1.0.0</span></div>
          <div className="flex justify-between"><span>Environment</span><span className="font-mono text-accent-emerald">{process.env.NODE_ENV}</span></div>
          <div className="flex justify-between"><span>Framework</span><span className="font-mono text-text-primary">Next.js 14</span></div>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Email Configuration</CardTitle></CardHeader>
        <div className="space-y-2 text-sm text-text-secondary">
          <div className="flex justify-between">
            <span>SMTP Host</span>
            <span className="font-mono text-text-primary">{process.env['SMTP_HOST'] ? '••••••••' : 'Console (dev)'}</span>
          </div>
          <div className="flex justify-between">
            <span>From Address</span>
            <span className="font-mono text-text-primary">noreply@dispatchiq.com</span>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Real-time</CardTitle></CardHeader>
        <div className="space-y-2 text-sm text-text-secondary">
          <div className="flex justify-between"><span>Transport</span><span className="font-mono text-text-primary">Socket.io</span></div>
          <div className="flex justify-between"><span>Path</span><span className="font-mono text-text-primary">/api/socketio</span></div>
        </div>
      </Card>
    </div>
  );
}
