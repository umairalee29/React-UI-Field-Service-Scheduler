'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatScheduledAt, formatDuration } from '@/lib/formatters';
import { PRIORITY_COLORS, JOB_TYPE_STYLES } from '@/lib/jobConstants';
import type { IJob, IUser } from '@/types';

interface Props {
  job: IJob;
  onClick: (job: IJob) => void;
}

export function JobCard({ job, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const tech = job.technicianId && typeof job.technicianId === 'object'
    ? (job.technicianId as IUser)
    : null;

  const priorityColor = PRIORITY_COLORS[job.priority] ?? '#64748b';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(job)}
      className="relative bg-bg-primary border border-border-dark rounded-lg overflow-hidden cursor-pointer hover:border-accent-blue/50 transition-colors select-none"
    >
      {/* Priority accent strip — same pattern as KPI cards on the dashboard */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: priorityColor }}
      />

      {/* Card content — pl-4 keeps text clear of the 4 px strip */}
      <div className="p-3 pl-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-mono text-[10px] text-text-secondary">{job.jobNumber}</p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize ${JOB_TYPE_STYLES[job.type] ?? 'bg-bg-card text-text-secondary'}`}>
                {job.type}
              </span>
            </div>
            <p className="text-sm font-medium text-text-primary line-clamp-2 leading-snug mt-0.5">{job.title}</p>
          </div>
          <PriorityBadge priority={job.priority} className="flex-shrink-0" />
        </div>

        <p className="text-xs text-text-secondary truncate">{job.customer.name}</p>

        <div className="flex items-center justify-between">
          <p className="text-xs text-text-secondary">{formatScheduledAt(job.scheduledAt)}</p>
          <p className="text-xs text-text-secondary">{formatDuration(job.estimatedDuration)}</p>
        </div>

        <div className="flex items-center gap-1.5 pt-1 border-t border-border-dark">
          {tech ? (
            <>
              <Avatar name={tech.name} src={tech.avatar} size="sm" />
              <span className="text-xs text-text-secondary truncate">{tech.name}</span>
            </>
          ) : (
            <StatusBadge status="unassigned" />
          )}
        </div>
      </div>
    </div>
  );
}
