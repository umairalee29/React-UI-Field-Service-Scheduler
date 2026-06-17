'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { formatScheduledAt, formatDuration, formatAddress } from '@/lib/formatters';
import type { IJob, JobStatus } from '@/types';
import { isToday } from 'date-fns';

const STATUS_ACTIONS: Partial<Record<JobStatus, { label: string; next: JobStatus; color: string }>> = {
  assigned: { label: 'Start Job', next: 'in_progress', color: 'bg-accent-amber' },
  in_progress: { label: 'Complete Job', next: 'completed', color: 'bg-accent-emerald' },
  on_hold: { label: 'Resume Job', next: 'in_progress', color: 'bg-accent-blue' },
};

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/jobs')
      .then((r) => r.json())
      .then((d) => { if (d.success) setJobs(d.data.jobs); })
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (job: IJob, next: JobStatus) => {
    setUpdating(job._id);
    try {
      const res = await fetch(`/api/jobs/${job._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next, note: `Status updated by technician` }),
      });
      const data = await res.json();
      if (data.success) {
        setJobs((prev) => prev.map((j) => j._id === job._id ? data.data : j));
        toast.success('Status updated');
      } else {
        toast.error(data.error ?? 'Failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setUpdating(null);
    }
  };

  const todayJobs = jobs.filter((j) => isToday(new Date(j.scheduledAt)));
  const otherJobs = jobs.filter((j) => !isToday(new Date(j.scheduledAt)));

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  const JobCard = ({ job }: { job: IJob }) => {
    const action = STATUS_ACTIONS[job.status];
    return (
      <div className="bg-bg-card border border-border-dark rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-xs text-text-secondary">{job.jobNumber}</p>
            <Link href={`/my-jobs/${job._id}`} className="text-base font-semibold text-text-primary hover:text-accent-blue transition-colors">
              {job.title}
            </Link>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <StatusBadge status={job.status} />
            <PriorityBadge priority={job.priority} />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-text-primary">{job.customer.name}</p>
          <p className="text-sm text-text-secondary">{formatAddress(job.customer.address)}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <span>🕐 {formatScheduledAt(job.scheduledAt)}</span>
          <span>⏱ {formatDuration(job.estimatedDuration)}</span>
        </div>

        {action && job.status !== 'completed' && job.status !== 'cancelled' && (
          <Button
            onClick={() => updateStatus(job, action.next)}
            loading={updating === job._id}
            className={`w-full min-h-[48px] ${action.color} text-white hover:opacity-90 border-0`}
          >
            {action.label}
          </Button>
        )}

        {job.status === 'in_progress' && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => updateStatus(job, 'on_hold')}
            loading={updating === job._id}
          >
            Put on Hold
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {todayJobs.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-accent-amber uppercase tracking-wide mb-3">Today</h2>
          <div className="space-y-3">
            {todayJobs.map((j) => <JobCard key={j._id} job={j} />)}
          </div>
        </div>
      )}

      {otherJobs.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">Other Jobs</h2>
          <div className="space-y-3">
            {otherJobs.map((j) => <JobCard key={j._id} job={j} />)}
          </div>
        </div>
      )}

      {jobs.length === 0 && (
        <div className="text-center py-16 text-text-secondary">
          <div className="text-4xl mb-3">📋</div>
          <p>No jobs assigned yet.</p>
        </div>
      )}
    </div>
  );
}
