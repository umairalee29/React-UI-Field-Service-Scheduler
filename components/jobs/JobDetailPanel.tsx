'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { JobStatusTimeline } from './JobStatusTimeline';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatScheduledAt, formatDuration, formatAddress } from '@/lib/formatters';
import type { IJob, IStatusHistory, IUser, JobStatus } from '@/types';
import { useJobStore } from '@/store/jobStore';

interface Props {
  jobId: string | null;
  onClose: () => void;
}

export function JobDetailPanel({ jobId, onClose }: Props) {
  const [job, setJob] = useState<IJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [newStatus, setNewStatus] = useState<JobStatus | ''>('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const { updateJob } = useJobStore();
  const router = useRouter();

  useEffect(() => {
    if (!jobId) { setJob(null); return; }
    setLoading(true);
    fetch(`/api/jobs/${jobId}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setJob(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatusUpdate = async () => {
    if (!job || !newStatus) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/jobs/${job._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note }),
      });
      const data = await res.json();
      if (data.success) {
        setJob(data.data);
        updateJob(job._id, data.data);
        toast.success('Status updated');
        setNewStatus('');
        setNote('');
      } else {
        toast.error(data.error ?? 'Failed to update');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setUpdating(false);
    }
  };

  const tech = job?.technicianId && typeof job.technicianId === 'object'
    ? (job.technicianId as IUser)
    : null;
  const statusHistory = (job?.statusHistory ?? []) as IStatusHistory[];
  const [lng, lat] = job?.location.coordinates ?? [0, 0];

  return (
    <AnimatePresence>
      {jobId && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-secondary border-l border-border-dark z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-border-dark gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs text-text-secondary mb-0.5">{job?.jobNumber ?? '…'}</p>
                <h2 className="text-base font-semibold text-text-primary leading-snug line-clamp-2">
                  {job?.title ?? '…'}
                </h2>
              </div>
              <button onClick={onClose} className="text-text-secondary hover:text-text-primary p-1 flex-shrink-0 mt-0.5">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="flex-1 overflow-y-auto">
                {/* Badges */}
                <div className="px-6 py-3 border-b border-border-dark">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
                {/* Customer */}
                <div className="px-6 py-4 border-b border-border-dark space-y-2">
                  <Skeleton className="h-2.5 w-16 mb-3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-2/5" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-28 mt-1" />
                </div>
                {/* Schedule */}
                <div className="px-6 py-4 border-b border-border-dark space-y-2">
                  <Skeleton className="h-2.5 w-16 mb-3" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
                {/* Technician */}
                <div className="px-6 py-4 border-b border-border-dark">
                  <Skeleton className="h-2.5 w-20 mb-3" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/5" />
                    </div>
                  </div>
                </div>
                {/* Status update */}
                <div className="px-6 py-4 border-b border-border-dark space-y-3">
                  <Skeleton className="h-2.5 w-24" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-8 w-28 rounded-lg" />
                </div>
                {/* History */}
                <div className="px-6 py-4">
                  <Skeleton className="h-2.5 w-14 mb-4" />
                  <div className="space-y-0">
                    {[0, 1].map((i) => (
                      <div key={i} className="flex gap-4 pb-5">
                        <div className="flex flex-col items-center">
                          <Skeleton className="h-2.5 w-2.5 rounded-full mt-1 flex-shrink-0" />
                          {i === 0 && <div className="w-px flex-1 bg-border-dark mt-1" />}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-5 w-24 rounded-full" />
                          </div>
                          <Skeleton className="h-3 w-3/4" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : job ? (
              <div className="flex-1 overflow-y-auto">
                {/* Badges */}
                <div className="px-6 py-3 border-b border-border-dark">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={job.status} />
                    <PriorityBadge priority={job.priority} />
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-bg-card text-text-secondary capitalize">
                      {job.type}
                    </span>
                  </div>
                </div>

                {/* Customer */}
                <div className="px-6 py-4 border-b border-border-dark space-y-1">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Customer</p>
                  <p className="text-sm font-medium text-text-primary">{job.customer.name}</p>
                  <p className="text-sm text-text-secondary">{job.customer.phone}</p>
                  <p className="text-sm text-text-secondary">{job.customer.email}</p>
                  <p className="text-sm text-text-secondary">{formatAddress(job.customer.address)}</p>
                  <a
                    href={`https://maps.google.com/?q=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent-blue hover:underline mt-1"
                  >
                    Open in Google Maps ↗
                  </a>
                </div>

                {/* Schedule */}
                <div className="px-6 py-4 border-b border-border-dark space-y-1">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Schedule</p>
                  <p className="text-sm text-text-primary">{formatScheduledAt(job.scheduledAt)}</p>
                  <p className="text-sm text-text-secondary">Estimated: {formatDuration(job.estimatedDuration)}</p>
                  {job.actualDuration && (
                    <p className="text-sm text-text-secondary">Actual: {formatDuration(job.actualDuration)}</p>
                  )}
                </div>

                {/* Technician */}
                <div className="px-6 py-4 border-b border-border-dark">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Assigned To</p>
                  {tech ? (
                    <div className="flex items-center gap-3">
                      <Avatar name={tech.name} src={tech.avatar} size="md" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{tech.name}</p>
                        <p className="text-xs text-text-secondary">{tech.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary italic">Unassigned</p>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() => router.push(`/jobs/${job._id}`)}
                  >
                    Open full view
                  </Button>
                </div>

                {/* Status update */}
                <div className="px-6 py-4 border-b border-border-dark space-y-3">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Update Status</p>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as JobStatus)}
                    className="w-full bg-bg-primary border border-border-dark rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  >
                    <option value="">Select new status…</option>
                    {(['unassigned','assigned','in_progress','on_hold','completed','cancelled'] as JobStatus[]).map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Optional note…"
                    rows={2}
                    className="w-full bg-bg-primary border border-border-dark rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent-blue resize-none"
                  />
                  <Button
                    size="sm"
                    loading={updating}
                    disabled={!newStatus}
                    onClick={handleStatusUpdate}
                  >
                    Update Status
                  </Button>
                </div>

                {/* Timeline */}
                <div className="px-6 py-4">
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-4">History</p>
                  <JobStatusTimeline history={statusHistory} />
                </div>
              </div>
            ) : null}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
