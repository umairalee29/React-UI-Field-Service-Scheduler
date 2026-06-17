'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { formatDuration } from '@/lib/formatters';

const STATUS_COLORS: Record<string, string> = {
  unassigned: '#64748b', assigned: '#3b82f6',
  in_progress: '#f59e0b', on_hold: '#8b5cf6',
  completed: '#10b981', cancelled: '#ef4444',
};

interface OverviewData {
  totalJobs: number;
  totalTechnicians: number;
  jobsByStatus: Record<string, number>;
  jobsByPriority: Record<string, number>;
  avgCompletionTimeMinutes: number;
  completedThisWeek: number;
  completedLastWeek: number;
  topTechnicians: Array<{ technician: { _id: string; name: string }; completedCount: number }>;
  dailyTrend: Array<{ date: string; created: number; completed: number }>;
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'technician'>('overview');

  useEffect(() => {
    fetch('/api/analytics/overview')
      .then((r) => r.json())
      .then((d) => { if (d.success) setOverview(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  if (!overview) return <p className="text-text-secondary">Failed to load analytics.</p>;

  const statusChartData = Object.entries(overview.jobsByStatus).map(([name, value]) => ({
    name: name.replace(/_/g, ' '), value, fill: STATUS_COLORS[name] ?? '#64748b',
  }));

  const weekChange = overview.completedLastWeek
    ? Math.round(((overview.completedThisWeek - overview.completedLastWeek) / overview.completedLastWeek) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-text-secondary text-sm">Total Jobs</p>
          <p className="text-3xl font-bold text-text-primary mt-1">{overview.totalJobs}</p>
        </Card>
        <Card>
          <p className="text-text-secondary text-sm">Avg Completion</p>
          <p className="text-3xl font-bold text-accent-blue mt-1">{formatDuration(Math.round(overview.avgCompletionTimeMinutes))}</p>
        </Card>
        <Card>
          <p className="text-text-secondary text-sm">Completed This Week</p>
          <p className="text-3xl font-bold text-accent-emerald mt-1">{overview.completedThisWeek}</p>
          {weekChange !== 0 && (
            <p className={`text-xs mt-1 ${weekChange > 0 ? 'text-accent-emerald' : 'text-accent-red'}`}>
              {weekChange > 0 ? '▲' : '▼'} {Math.abs(weekChange)}% vs last week
            </p>
          )}
        </Card>
        <Card>
          <p className="text-text-secondary text-sm">Field Technicians</p>
          <p className="text-3xl font-bold text-accent-purple mt-1">{overview.totalTechnicians}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Jobs by Status</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader><CardTitle>30-Day Trend</CardTitle></CardHeader>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={overview.dailyTrend.slice(-30)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} dot={false} name="Created" />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={false} name="Completed" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Technicians */}
      <Card>
        <CardHeader><CardTitle>Top Technicians</CardTitle></CardHeader>
        <div className="space-y-3">
          {overview.topTechnicians.map((entry, i) => (
            <div key={entry.technician._id} className="flex items-center gap-3">
              <span className="text-lg font-bold text-text-secondary w-6 text-center">{i + 1}</span>
              <div className="h-8 w-8 rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center text-xs font-bold text-accent-blue">
                {entry.technician.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{entry.technician.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-bg-primary rounded-full h-1.5">
                  <div
                    className="bg-accent-emerald h-1.5 rounded-full"
                    style={{ width: `${Math.min(100, (entry.completedCount / (overview.topTechnicians[0]?.completedCount ?? 1)) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-accent-emerald w-8 text-right">{entry.completedCount}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
