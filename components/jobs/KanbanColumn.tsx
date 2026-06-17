'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { JobCard } from './JobCard';
import type { IJob, JobStatus } from '@/types';

const STATUS_COLORS: Record<JobStatus, string> = {
  unassigned: '#64748b',
  assigned: '#3b82f6',
  in_progress: '#f59e0b',
  on_hold: '#8b5cf6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<JobStatus, string> = {
  unassigned: 'Unassigned',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

interface Props {
  status: JobStatus;
  jobs: IJob[];
  onJobClick: (job: IJob) => void;
}

export function KanbanColumn({ status, jobs, onJobClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const color = STATUS_COLORS[status];

  return (
    <div className="flex flex-col min-w-[280px] max-w-[280px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-semibold text-text-primary">{STATUS_LABELS[status]}</span>
        <span
          className="ml-auto text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {jobs.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-2 min-h-[200px] transition-colors ${
          isOver ? 'bg-bg-card border-2 border-dashed' : 'bg-bg-card/40'
        }`}
        style={{ borderColor: isOver ? color : undefined }}
      >
        <SortableContext items={jobs.map((j) => j._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 scrollbar-thin">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-xs text-text-secondary/50 italic">
                No jobs
              </div>
            ) : (
              jobs.map((job) => (
                <JobCard key={job._id} job={job} onClick={onJobClick} />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
