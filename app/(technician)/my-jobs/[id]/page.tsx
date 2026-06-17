'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { JobStatusTimeline } from '@/components/jobs/JobStatusTimeline';
import { formatScheduledAt, formatDuration, formatAddress } from '@/lib/formatters';
import type { IJob, IStatusHistory, JobStatus } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';

export default function MyJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<IJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [actualDuration, setActualDuration] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  useEffect(() => {
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setJob(d.data); })
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: JobStatus, extra?: { actualDuration?: number; completionNotes?: string }) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/jobs/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note: `Status updated by technician`, ...extra }),
      });
      const data = await res.json();
      if (data.success) {
        setJob(data.data);
        setShowCompletion(false);
        toast.success('Status updated!');
      } else {
        toast.error(data.error ?? 'Failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setUpdating(false);
    }
  };

  const handleComplete = () => {
    updateStatus('completed', {
      actualDuration: actualDuration ? parseInt(actualDuration) : undefined,
      completionNotes: completionNotes || undefined,
    });
  };

  if (loading) return <div className="text-center py-20 text-text-secondary">Loading…</div>;
  if (!job) return <div className="text-center py-20 text-text-secondary">Job not found.</div>;

  const [lng, lat] = job.location.coordinates;
  const statusHistory = (job.statusHistory ?? []) as IStatusHistory[];

  return (
    <div className="max-w-lg mx-auto space-y-4 pb-24">
      {/* Header */}
      <div className="bg-bg-card border border-border-dark rounded-xl p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-mono text-xs text-text-secondary">{job.jobNumber}</p>
            <h2 className="text-lg font-bold text-text-primary font-heading mt-0.5">{job.title}</h2>
          </div>
          <StatusBadge status={job.status} />
        </div>
        <PriorityBadge priority={job.priority} />
        {job.description && <p className="text-sm text-text-secondary mt-2">{job.description}</p>}
      </div>

      {/* Customer */}
      <div className="bg-bg-card border border-border-dark rounded-xl p-4 space-y-1">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Customer</p>
        <p className="text-sm font-medium text-text-primary">{job.customer.name}</p>
        <a href={`tel:${job.customer.phone}`} className="text-sm text-accent-blue">{job.customer.phone}</a>
        <p className="text-sm text-text-secondary">{formatAddress(job.customer.address)}</p>
        <a
          href={`https://maps.google.com/?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-accent-blue font-medium mt-2"
        >
          📍 Open in Google Maps
        </a>
      </div>

      {/* Schedule */}
      <div className="bg-bg-card border border-border-dark rounded-xl p-4">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Schedule</p>
        <p className="text-sm text-text-primary">{formatScheduledAt(job.scheduledAt)}</p>
        <p className="text-sm text-text-secondary">Estimated: {formatDuration(job.estimatedDuration)}</p>
        {job.actualDuration && <p className="text-sm text-accent-emerald">Actual: {formatDuration(job.actualDuration)}</p>}
      </div>

      {/* Status actions */}
      {job.status !== 'completed' && job.status !== 'cancelled' && (
        <div className="space-y-2">
          {job.status === 'assigned' && (
            <Button
              className="w-full min-h-[56px] text-base bg-accent-amber text-white border-0"
              onClick={() => updateStatus('in_progress')}
              loading={updating}
            >
              🚀 Start Job
            </Button>
          )}
          {job.status === 'in_progress' && (
            <>
              <Button
                className="w-full min-h-[56px] text-base bg-accent-emerald text-white border-0"
                onClick={() => setShowCompletion(true)}
              >
                ✅ Complete Job
              </Button>
              <Button
                variant="secondary"
                className="w-full min-h-[48px]"
                onClick={() => updateStatus('on_hold')}
                loading={updating}
              >
                ⏸ Put on Hold
              </Button>
            </>
          )}
          {job.status === 'on_hold' && (
            <Button
              className="w-full min-h-[56px] text-base"
              onClick={() => updateStatus('in_progress')}
              loading={updating}
            >
              ▶ Resume Job
            </Button>
          )}
        </div>
      )}

      {job.status === 'completed' && (
        <div className="bg-accent-emerald/10 border border-accent-emerald/30 rounded-xl p-4 text-center">
          <p className="text-accent-emerald font-semibold">✅ Job Completed</p>
          {job.completionNotes && <p className="text-sm text-text-secondary mt-1">{job.completionNotes}</p>}
        </div>
      )}

      {/* Timeline */}
      {statusHistory.length > 0 && (
        <div className="bg-bg-card border border-border-dark rounded-xl p-4">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-4">History</p>
          <JobStatusTimeline history={statusHistory} />
        </div>
      )}

      {/* Completion modal */}
      <Modal isOpen={showCompletion} onClose={() => setShowCompletion(false)} title="Complete Job">
        <div className="space-y-4">
          <Input
            label="Actual Duration (minutes)"
            type="number"
            min={1}
            value={actualDuration}
            onChange={(e) => setActualDuration(e.target.value)}
            placeholder="e.g. 90"
          />
          <Textarea
            label="Completion Notes"
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Describe what was done…"
            rows={4}
          />
          <Button className="w-full" onClick={handleComplete} loading={updating}>
            Mark as Completed
          </Button>
        </div>
      </Modal>
    </div>
  );
}
