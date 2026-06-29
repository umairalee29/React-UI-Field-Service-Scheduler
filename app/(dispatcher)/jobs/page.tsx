'use client';

import { useState, useRef, useEffect } from 'react';
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
  { value: '',            label: 'All statuses', color: null },
  { value: 'unassigned',  label: 'Unassigned',   color: '#64748b' },
  { value: 'assigned',    label: 'Assigned',     color: '#3b82f6' },
  { value: 'in_progress', label: 'In Progress',  color: '#f59e0b' },
  { value: 'on_hold',     label: 'On Hold',      color: '#8b5cf6' },
  { value: 'completed',   label: 'Completed',    color: '#10b981' },
  { value: 'cancelled',   label: 'Cancelled',    color: '#ef4444' },
];

const PRIORITY_OPTIONS = [
  { value: 'low',      label: 'Low' },
  { value: 'medium',   label: 'Medium' },
  { value: 'high',     label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const TABS = [
  {
    id: 'kanban' as const,
    label: 'Kanban',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4a2 2 0 002-2V5a2 2 0 00-2-2zm10 0h-4a2 2 0 00-2 2v7a2 2 0 002 2h4a2 2 0 002-2V5a2 2 0 00-2-2z" />
      </svg>
    ),
  },
  {
    id: 'calendar' as const,
    label: 'Calendar',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function JobsPage() {
  const [tab, setTab] = useState<'kanban' | 'calendar'>('kanban');
  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const { filters, setFilters } = useJobStore();
  const { jobs, isLoading } = useJobs(filters);

  const hasActiveFilters = !!(filters.search || filters.status || filters.priority || filters.dateFrom);

  const selectedStatus = STATUS_OPTIONS.find((o) => o.value === (filters.status ?? ''))
    ?? { value: '', label: 'All statuses', color: null };

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-bg-card border border-border-dark rounded-lg p-1">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${tab === id ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {icon}
              {label}
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
          <div className="flex flex-col gap-1" ref={statusRef}>
            <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">Status</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusOpen((v) => !v)}
                className="w-40 flex items-center gap-2 bg-bg-primary border border-border-dark rounded-lg px-3 py-2 text-sm text-text-primary hover:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
              >
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: selectedStatus.color ?? '#475569' }}
                />
                <span className="flex-1 text-left truncate">{selectedStatus.label}</span>
                <svg
                  className={`h-3.5 w-3.5 text-text-secondary flex-shrink-0 transition-transform duration-150 ${statusOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {statusOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-44 bg-bg-card border border-border-dark rounded-xl shadow-xl shadow-black/40 z-50 overflow-hidden">
                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = (filters.status ?? '') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setFilters({ status: opt.value as typeof filters.status });
                          setStatusOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                          isSelected
                            ? 'bg-accent-blue/10 text-text-primary'
                            : 'text-text-secondary hover:bg-bg-primary hover:text-text-primary'
                        }`}
                      >
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ background: opt.color ?? '#475569' }}
                        />
                        <span className="flex-1 text-left">{opt.label}</span>
                        {isSelected && (
                          <svg className="h-3.5 w-3.5 text-accent-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
