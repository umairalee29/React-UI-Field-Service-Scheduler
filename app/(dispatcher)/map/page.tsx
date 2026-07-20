'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { StatusBadge } from '@/components/ui/Badge';
import { JOB_STATUSES, STATUS_COLORS, STATUS_LABELS } from '@/lib/jobConstants';
import type { IJob, TechnicianWithMeta } from '@/types';
import { useMapStore } from '@/store/mapStore';

type FilterOption = { value: string; label: string; color: string | null };

const STATUS_OPTIONS: FilterOption[] = [
  { value: '', label: 'All statuses', color: null },
  ...JOB_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s], color: STATUS_COLORS[s] })),
];

const DispatchMap = dynamic(
  () => import('@/components/map/DispatchMap').then((m) => m.DispatchMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-bg-card rounded-xl flex items-center justify-center text-text-secondary">Loading map…</div> }
);

export default function MapPage() {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianWithMeta[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const statusRef = useRef<HTMLDivElement>(null);
  const { setSelectedJobId } = useMapStore();

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch('/api/jobs?limit=200').then((r) => r.json()),
      fetch('/api/technicians').then((r) => r.json()),
    ]).then(([jobsData, techData]) => {
      if (jobsData.success) setJobs(jobsData.data.jobs);
      if (techData.success) setTechnicians(techData.data);
    });
  }, []);

  const filteredJobs = statusFilter ? jobs.filter((j) => j.status === statusFilter) : jobs;
  const selectedOption = STATUS_OPTIONS.find((o) => o.value === statusFilter)
    ?? { value: '', label: 'All statuses', color: null };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4 relative">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 flex-shrink-0 bg-bg-card border border-border-dark rounded-xl flex flex-col">
          <div className="p-3 border-b border-border-dark" ref={statusRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusOpen((v) => !v)}
                className="w-full flex items-center gap-2 bg-bg-primary border border-border-dark rounded-lg px-3 py-2 text-sm text-text-primary hover:border-accent-blue/50 focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
              >
                <span
                  className="h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: selectedOption.color ?? '#475569' }}
                />
                <span className="flex-1 text-left truncate">{selectedOption.label}</span>
                <svg
                  className={`h-3.5 w-3.5 text-text-secondary flex-shrink-0 transition-transform duration-150 ${statusOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {statusOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-full bg-bg-card border border-border-dark rounded-xl shadow-xl shadow-black/40 z-[500] overflow-hidden">
                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = statusFilter === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setStatusFilter(opt.value); setStatusOpen(false); }}
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
          <div className="flex-1 overflow-y-auto">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                onClick={() => setSelectedJobId(job._id)}
                className="flex items-start gap-2 px-3 py-2.5 border-b border-border-dark hover:bg-bg-primary cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-text-secondary">{job.jobNumber}</p>
                  <p className="text-xs font-medium text-text-primary truncate">{job.title}</p>
                  <p className="text-[10px] text-text-secondary">{job.customer.name}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-bg-card border border-border-dark rounded-r-lg p-1.5 text-text-secondary hover:text-text-primary transition-colors"
        style={{ left: sidebarOpen ? '256px' : '0' }}
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>

      {/* Map */}
      <div className="flex-1 rounded-xl overflow-hidden">
        <DispatchMap
          jobs={filteredJobs}
          technicians={technicians}
          onJobClick={(job) => setSelectedJobId(job._id)}
        />
      </div>
    </div>
  );
}
