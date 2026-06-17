'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { StatusBadge } from '@/components/ui/Badge';
import type { IJob, TechnicianWithMeta } from '@/types';
import { useMapStore } from '@/store/mapStore';

const DispatchMap = dynamic(
  () => import('@/components/map/DispatchMap').then((m) => m.DispatchMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-bg-card rounded-xl flex items-center justify-center text-text-secondary">Loading map…</div> }
);

export default function MapPage() {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianWithMeta[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { setSelectedJobId } = useMapStore();

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

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4 relative">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 flex-shrink-0 bg-bg-card border border-border-dark rounded-xl overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border-dark">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-bg-primary border border-border-dark rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue"
            >
              <option value="">All statuses</option>
              {['unassigned','assigned','in_progress','on_hold','completed','cancelled'].map((s) => (
                <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
              ))}
            </select>
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
