'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatScheduledAt, formatDuration } from '@/lib/formatters';
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(job)}
      className="bg-bg-primary border border-border-dark rounded-lg p-3 cursor-pointer hover:border-accent-blue/50 transition-colors space-y-2 select-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] text-text-secondary">{job.jobNumber}</p>
          <p className="text-sm font-medium text-text-primary line-clamp-2 leading-snug mt-0.5">{job.title}</p>
        </div>
        <PriorityBadge priority={job.priority} className="flex-shrink-0" />
      </div>

      <p className="text-xs text-text-secondary truncate">{job.customer.name}</p>

      <div className="flex items-center justify-between">
        <p className="text-xs text-text-secondary">{formatScheduledAt(job.scheduledAt)}</p>
        <p className="text-xs text-text-secondary">{formatDuration(job.estimatedDuration)}</p>
      </div>

      {tech && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-border-dark">
          <Avatar name={tech.name} src={tech.avatar} size="sm" />
          <span className="text-xs text-text-secondary truncate">{tech.name}</span>
        </div>
      )}
    </div>
  );
}
