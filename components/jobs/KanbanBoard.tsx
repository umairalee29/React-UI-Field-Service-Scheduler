'use client';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { KanbanColumn } from './KanbanColumn';
import { JobCard } from './JobCard';
import { JobDetailPanel } from './JobDetailPanel';
import { useJobStore } from '@/store/jobStore';
import type { IJob, JobStatus } from '@/types';

const COLUMNS: JobStatus[] = ['unassigned', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled'];

interface Props {
  jobs: IJob[];
}

export function KanbanBoard({ jobs }: Props) {
  const [activeJob, setActiveJob] = useState<IJob | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { updateJob } = useJobStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (e: DragStartEvent) => {
    const job = jobs.find((j) => j._id === e.active.id);
    setActiveJob(job ?? null);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveJob(null);
    const { active, over } = e;
    if (!over) return;

    const job = jobs.find((j) => j._id === active.id);
    if (!job) return;

    const targetStatus = over.id as JobStatus;
    if (job.status === targetStatus) return;

    // Optimistic update
    updateJob(job._id, { status: targetStatus });

    try {
      const res = await fetch(`/api/jobs/${job._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus, note: 'Status updated via Kanban' }),
      });
      const data = await res.json();
      if (!data.success) {
        updateJob(job._id, { status: job.status }); // revert
        toast.error(data.error ?? 'Failed to update');
      } else {
        updateJob(job._id, data.data);
        toast.success('Status updated');
      }
    } catch {
      updateJob(job._id, { status: job.status }); // revert
      toast.error('Network error');
    }
  };

  const groupedJobs = COLUMNS.reduce<Record<JobStatus, IJob[]>>(
    (acc, s) => ({ ...acc, [s]: jobs.filter((j) => j.status === s) }),
    {} as Record<JobStatus, IJob[]>
  );

  return (
    <>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-0">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              jobs={groupedJobs[status] ?? []}
              onJobClick={(job) => setSelectedJobId(job._id)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeJob && (
            <div className="rotate-3 opacity-90">
              <JobCard job={activeJob} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <JobDetailPanel
        jobId={selectedJobId}
        onClose={() => setSelectedJobId(null)}
      />
    </>
  );
}
