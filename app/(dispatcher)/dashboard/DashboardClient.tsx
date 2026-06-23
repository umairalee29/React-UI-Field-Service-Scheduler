'use client';

import { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useSocket } from '@/hooks/useSocket';
import { timeAgo } from '@/lib/formatters';
import type { IUser, IJob } from '@/types';

const STATUS_COLORS = {
  unassigned: '#64748b', assigned: '#3b82f6',
  in_progress: '#f59e0b', on_hold: '#8b5cf6',
  completed: '#10b981', cancelled: '#ef4444',
};

const KpiIcons = {
  openJobs: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  inProgress: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  completed: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  critical: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

interface KpiCardProps { label: string; value: number; color: string; icon: keyof typeof KpiIcons }
function KpiCard({ label, value, color, icon }: KpiCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-sm">{label}</p>
          <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
        </div>
        <div
          className="p-3 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {KpiIcons[icon]}
        </div>
      </div>
    </Card>
  );
}

interface ActivityItem {
  id: string;
  message: string;
  job?: IJob;
  at: Date;
}

interface Props {
  openJobs: number;
  inProgressToday: number;
  completedToday: number;
  criticalJobs: number;
  technicians: IUser[];
}

export function DashboardClient({ openJobs, inProgressToday, completedToday, criticalJobs, technicians }: Props) {
  const socket = useSocket();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    socket.emit('join:dispatcher');

    socket.on('job:statusChanged', ({ job }: { job: IJob }) => {
      setActivity((prev) => [
        {
          id: `${job._id}-${Date.now()}`,
          message: `${job.jobNumber} → ${job.status.replace(/_/g, ' ')}`,
          job,
          at: new Date(),
        },
        ...prev.slice(0, 19),
      ]);
    });

    socket.on('job:created', ({ job }: { job: IJob }) => {
      setActivity((prev) => [
        {
          id: `${job._id}-new-${Date.now()}`,
          message: `New job created: ${job.jobNumber}`,
          job,
          at: new Date(),
        },
        ...prev.slice(0, 19),
      ]);
    });

    return () => {
      socket.off('job:statusChanged');
      socket.off('job:created');
    };
  }, [socket]);

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const { jobsByStatus } = d.data;
          setStatusData(
            Object.entries(jobsByStatus).map(([name, value]) => ({
              name: name.replace(/_/g, ' '),
              value: value as number,
              color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] ?? '#64748b',
            }))
          );
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Open Jobs" value={openJobs} color="#3b82f6" icon="openJobs" />
        <KpiCard label="In Progress Today" value={inProgressToday} color="#f59e0b" icon="inProgress" />
        <KpiCard label="Completed Today" value={completedToday} color="#10b981" icon="completed" />
        <KpiCard label="Critical Jobs" value={criticalJobs} color="#ef4444" icon="critical" />
      </div>

      {/* Charts + Technicians row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Donut */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Jobs by Status</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-text-secondary capitalize truncate">{d.name}</span>
                <span className="text-xs text-text-primary ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Technicians */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Technicians</CardTitle></CardHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {technicians.map((tech) => (
              <div key={tech._id} className="flex items-center gap-3">
                <Avatar name={tech.name} src={tech.avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{tech.name}</p>
                  <p className="text-xs text-text-secondary truncate">{(tech.skills ?? []).slice(0, 2).join(', ')}</p>
                </div>
                <div className={`h-2 w-2 rounded-full ${tech.isAvailable ? 'bg-accent-emerald' : 'bg-accent-amber'}`} />
              </div>
            ))}
          </div>
        </Card>

        {/* Activity */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Live Activity</CardTitle></CardHeader>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activity.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-4">Waiting for activity…</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="flex gap-2 text-sm">
                  <span className="text-text-secondary flex-shrink-0">{timeAgo(item.at)}</span>
                  <span className="text-text-primary truncate">{item.message}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
