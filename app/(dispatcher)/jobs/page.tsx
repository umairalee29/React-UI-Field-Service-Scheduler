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

const STATUS_OPTIONS = [
  { value: 'unassigned',  label: 'Unassigned' },
  { value: 'assigned',    label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold',     label: 'On Hold' },
  { value: 'completed',   label: 'Completed' },
  { value: 'cancelled',   label: 'Cancelled' },
];

const PRIORITY_OPTIONS = [
  { value: 'low',      label: 'Low' },
  { value: 'medium',   label: 'Medium' },
  { value: 'high',     label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function JobsPage() {
  const [tab, setTab] = useState<'kanban' | 'calendar'>('kanban');
  const { filters, setFilters } = useJobStore();
  const { jobs, isLoading } = useJobs(filters);

  const hasActiveFilters = !!(filters.search || filters.status || filters.priority || filters.dateFrom);

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
      <div className="bg-bg-card border border-border-dark rounded-xl px-4 py-3">
        <div className="flex flex-wrap items-end gap-3">

          {/* Search */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">Search</span>
            <Input
              placeholder="Job title, customer…"
              value={filters.search ?? ''}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-52"
            />
          </div>

          <div className="hidden sm:block h-9 w-px bg-border-dark self-end" />

          {/* Status */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">Status</span>
            <Select
              value={filters.status ?? ''}
              onChange={(e) => setFilters({ status: e.target.value as typeof filters.status })}
              className="w-40"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">Priority</span>
            <Select
              value={filters.priority ?? ''}
              onChange={(e) => setFilters({ priority: e.target.value as typeof filters.priority })}
              className="w-36"
            >
              <option value="">All priorities</option>
              {PRIORITY_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </div>

          <div className="hidden sm:block h-9 w-px bg-border-dark self-end" />

          {/* Date range */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">From</span>
            <Input
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={(e) => setFilters({ dateFrom: e.target.value })}
              onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch {} }}
              className="w-40 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">To</span>
            <Input
              type="date"
              value={filters.dateTo ?? ''}
              onChange={(e) => setFilters({ dateTo: e.target.value })}
              onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch {} }}
              className="w-40 cursor-pointer"
            />
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ search: '', status: '', priority: '', dateFrom: '', dateTo: '' })}
              className="self-end"
            >
              Clear filters
            </Button>
          )}
        </div>
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
