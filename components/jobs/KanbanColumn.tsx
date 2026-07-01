'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { JobCard } from './JobCard';
import { STATUS_COLORS, STATUS_LABELS, EMPTY_MESSAGES } from '@/lib/jobConstants';
import type { IJob, JobStatus } from '@/types';

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
      <div
        className="flex items-center gap-2 mb-3 px-3 py-2.5 bg-bg-card rounded-xl border border-border-dark border-t-2"
        style={{ borderTopColor: color }}
      >
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
              <div className="flex flex-col items-center justify-center py-10 gap-2 select-none">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ background: `${color}15` }}
                >
                  <svg
                    className="h-5 w-5"
                    style={{ color }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-text-secondary/60">{EMPTY_MESSAGES[status]}</p>
                <p className="text-[10px] text-text-secondary/35">Drop cards here</p>
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
