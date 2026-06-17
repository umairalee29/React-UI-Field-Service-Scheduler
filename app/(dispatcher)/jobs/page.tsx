'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useJobs } from '@/hooks/useJobs';
import { useJobStore } from '@/store/jobStore';
import { SkeletonKanban } from '@/components/ui/Skeleton';

const KanbanBoard = dynamic(
  () => import('@/components/jobs/KanbanBoard').then((m) => m.KanbanBoard),
  { ssr: false, loading: () => <SkeletonKanban /> }
);

const CalendarView = dynamic(
  () => import('@/components/jobs/CalendarView').then((m) => m.CalendarView),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center text-text-secondary">Loading calendar…</div> }
);

export default function JobsPage() {
  const [tab, setTab] = useState<'kanban' | 'calendar'>('kanban');
  const { filters, setFilters } = useJobStore();
  const { jobs, isLoading } = useJobs(filters);

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-bg-card border border-border-dark rounded-lg p-1">
          {(['kanban', 'calendar'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${tab === t ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <Link href="/jobs/new">
          <Button size="sm">+ New Job</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search jobs…"
          value={filters.search ?? ''}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="w-48"
        />
        <Select
          value={filters.status ?? ''}
          onChange={(e) => setFilters({ status: e.target.value as typeof filters.status })}
          className="w-40"
        >
          <option value="">All statuses</option>
          {['unassigned','assigned','in_progress','on_hold','completed','cancelled'].map((s) => (
            <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
          ))}
        </Select>
        <Select
          value={filters.priority ?? ''}
          onChange={(e) => setFilters({ priority: e.target.value as typeof filters.priority })}
          className="w-36"
        >
          <option value="">All priorities</option>
          {['low','medium','high','critical'].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
        <Input
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => setFilters({ dateFrom: e.target.value })}
          className="w-40"
        />
        <Input
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(e) => setFilters({ dateTo: e.target.value })}
          className="w-40"
        />
        {(filters.search || filters.status || filters.priority || filters.dateFrom) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({ search: '', status: '', priority: '', dateFrom: '', dateTo: '' })}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Board */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <SkeletonKanban />
        ) : tab === 'kanban' ? (
          <KanbanBoard jobs={jobs} />
        ) : (
          <CalendarView jobs={jobs} />
        )}
      </div>
    </div>
  );
}
