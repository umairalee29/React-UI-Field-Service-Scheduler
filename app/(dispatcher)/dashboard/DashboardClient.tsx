'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useSocket } from '@/hooks/useSocket';
import { formatTime, formatDuration, timeAgo } from '@/lib/formatters';
import type { IUser, IJob } from '@/types';
import type { TodayJob } from './page';

const STATUS_COLORS: Record<string, string> = {
  unassigned: '#64748b', assigned: '#3b82f6',
  in_progress: '#f59e0b', on_hold: '#8b5cf6',
  completed: '#10b981', cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  unassigned: 'Unassigned', assigned: 'Assigned',
  in_progress: 'In Progress', on_hold: 'On Hold',
  completed: 'Completed', cancelled: 'Cancelled',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#64748b', medium: '#3b82f6', high: '#f59e0b', critical: '#ef4444',
};

function TodaySchedule({ jobs }: { jobs: TodayJob[] }) {
  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Today&apos;s Schedule</CardTitle>
            <p className="text-xs text-text-secondary mt-0.5">{dateLabel}</p>
          </div>
          <Link href="/jobs/new" className="text-xs text-accent-blue hover:underline">+ New Job</Link>
        </CardHeader>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <svg className="h-10 w-10 text-border-dark mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-text-secondary">No jobs scheduled for today</p>
          <Link href="/jobs/new" className="mt-3 text-xs text-accent-blue hover:underline">Schedule a job</Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Today&apos;s Schedule</CardTitle>
          <p className="text-xs text-text-secondary mt-0.5">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</span>
          <Link href="/jobs" className="text-xs text-accent-blue hover:underline">View all →</Link>
        </div>
      </CardHeader>

      {/* Column headers */}
      <div className="hidden md:grid grid-cols-[90px_1fr_1fr_160px_110px] gap-4 px-2 pb-2 border-b border-border-dark">
        {['Time', 'Job', 'Customer', 'Technician', 'Status'].map((h) => (
          <span key={h} className="text-xs font-medium text-text-secondary uppercase tracking-wide">{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-border-dark/50">
        {jobs.map((job) => {
          const isPast = new Date(job.scheduledAt) < new Date() && job.status !== 'completed';
          const statusColor = STATUS_COLORS[job.status] ?? '#64748b';
          const priorityColor = PRIORITY_COLORS[job.priority] ?? '#64748b';

          return (
            <Link
              key={job._id}
              href={`/jobs`}
              className="grid grid-cols-1 md:grid-cols-[90px_1fr_1fr_160px_110px] gap-2 md:gap-4 px-2 py-3 rounded-lg hover:bg-bg-primary/50 transition-colors group items-center"
            >
              {/* Time */}
              <div className="flex items-center gap-2 md:block">
                <span className={`text-sm font-mono font-medium ${isPast && job.status !== 'completed' ? 'text-accent-red' : 'text-text-primary'}`}>
                  {formatTime(job.scheduledAt)}
                </span>
                <span className="text-xs text-text-secondary md:block">{formatDuration(job.estimatedDuration)}</span>
              </div>

              {/* Job */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                    style={{ background: priorityColor }}
                  />
                  <span className="text-xs font-mono text-text-secondary">{job.jobNumber}</span>
                </div>
                <p className="text-sm font-medium text-text-primary truncate mt-0.5">{job.title}</p>
              </div>

              {/* Customer */}
              <div className="min-w-0">
                <p className="text-sm text-text-secondary truncate">{job.customer.name}</p>
              </div>

              {/* Technician */}
              <div className="flex items-center gap-2 min-w-0">
                {job.technician ? (
                  <>
                    <Avatar name={job.technician.name} src={job.technician.avatar} size="sm" />
                    <span className="text-sm text-text-primary truncate">{job.technician.name}</span>
                  </>
                ) : (
                  <span className="text-xs font-medium text-accent-amber bg-accent-amber/10 px-2 py-0.5 rounded-full">
                    Unassigned
                  </span>
                )}
              </div>

              {/* Status */}
              <div>
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: `${statusColor}18`, color: statusColor }}
                >
                  <span className="h-1 w-1 rounded-full" style={{ background: statusColor }} />
                  {STATUS_LABELS[job.status] ?? job.status}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

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

interface KpiCardProps {
  label: string;
  value: number;
  color: string;
  icon: keyof typeof KpiIcons;
  trend: number;
  higherIsBetter: boolean;
}
function KpiCard({ label, value, color, icon, trend, higherIsBetter }: KpiCardProps) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;
  const isGood = isNeutral ? null : (higherIsBetter ? isPositive : !isPositive);
  const trendColor = isNeutral ? '#64748b' : isGood ? '#10b981' : '#ef4444';
  const trendLabel = isNeutral
    ? 'same as yesterday'
    : `${isPositive ? '+' : ''}${trend} vs yesterday`;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-sm">{label}</p>
          <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {!isNeutral && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke={trendColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isPositive
                  ? <polyline points="18 15 12 9 6 15" />
                  : <polyline points="6 9 12 15 18 9" />}
              </svg>
            )}
            <span className="text-xs" style={{ color: trendColor }}>{trendLabel}</span>
          </div>
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
  at: Date;
  isLive?: boolean;
}

interface Props {
  openJobs: number;
  inProgressToday: number;
  completedToday: number;
  criticalJobs: number;
  openJobsTrend: number;
  inProgressTrend: number;
  completedTrend: number;
  criticalTrend: number;
  technicians: IUser[];
  todaysJobs: TodayJob[];
}

export function DashboardClient({ openJobs, inProgressToday, completedToday, criticalJobs, openJobsTrend, inProgressTrend, completedTrend, criticalTrend, technicians, todaysJobs }: Props) {
  const socket = useSocket();
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);

  // Pre-populate from DB on mount
  useEffect(() => {
    fetch('/api/analytics/activity')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const historical: ActivityItem[] = d.data.map((entry: any) => ({
            id: entry._id,
            message: `${entry.jobId?.jobNumber ?? '—'} → ${STATUS_LABELS[entry.status] ?? entry.status}`,
            at: new Date(entry.changedAt),
            isLive: false,
          }));
          setActivity(historical);
        }
      })
      .catch(console.error);
  }, []);

  // Real-time socket events prepended on top
  useEffect(() => {
    socket.emit('join:dispatcher');

    socket.on('job:statusChanged', ({ job }: { job: IJob }) => {
      setActivity((prev) => [
        {
          id: `${job._id}-${Date.now()}`,
          message: `${job.jobNumber} → ${STATUS_LABELS[job.status] ?? job.status}`,
          at: new Date(),
          isLive: true,
        },
        ...prev.slice(0, 19),
      ]);
    });

    socket.on('job:created', ({ job }: { job: IJob }) => {
      setActivity((prev) => [
        {
          id: `${job._id}-new-${Date.now()}`,
          message: `New job created: ${job.jobNumber}`,
          at: new Date(),
          isLive: true,
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
        <KpiCard label="Open Jobs" value={openJobs} color="#3b82f6" icon="openJobs" trend={openJobsTrend} higherIsBetter={false} />
        <KpiCard label="In Progress Today" value={inProgressToday} color="#f59e0b" icon="inProgress" trend={inProgressTrend} higherIsBetter={true} />
        <KpiCard label="Completed Today" value={completedToday} color="#10b981" icon="completed" trend={completedTrend} higherIsBetter={true} />
        <KpiCard label="Critical Jobs" value={criticalJobs} color="#ef4444" icon="critical" trend={criticalTrend} higherIsBetter={false} />
      </div>

      {/* Today's Schedule */}
      <TodaySchedule jobs={todaysJobs} />

      {/* Chart + sidebar row */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Bar chart */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Jobs by Status</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={statusData} barCategoryGap="30%" margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#1e293b" strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => v.replace(' ', '\n')}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: '#ffffff08' }}
                contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9', fontWeight: 600, textTransform: 'capitalize' }}
                itemStyle={{ color: '#94a3b8' }}
                formatter={(value: number) => [value, 'Jobs']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Technicians */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Technicians</CardTitle></CardHeader>
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {technicians.map((tech) => (
              <div key={tech._id} className="flex items-center gap-3">
                <Avatar name={tech.name} src={tech.avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{tech.name}</p>
                  <p className="text-xs text-text-secondary truncate">{(tech.skills ?? []).slice(0, 2).join(', ')}</p>
                </div>
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${tech.isAvailable ? 'bg-accent-emerald' : 'bg-accent-amber'}`} />
              </div>
            ))}
          </div>
        </Card>

        {/* Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Live Activity</CardTitle>
            <span className="flex items-center gap-1.5 text-xs text-accent-emerald">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-emerald animate-pulse" />
              Live
            </span>
          </CardHeader>
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  {item.isLive
                    ? <span className="h-1.5 w-1.5 rounded-full bg-accent-blue block" />
                    : <span className="h-1.5 w-1.5 rounded-full bg-border-dark block" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{item.message}</p>
                  <p className="text-xs text-text-secondary">{timeAgo(item.at)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
