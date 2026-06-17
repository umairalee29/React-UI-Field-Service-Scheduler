import { cn } from '@/lib/cn';
import type { JobStatus, JobPriority, UserRole } from '@/types';

const statusColors: Record<JobStatus, { bg: string; text: string }> = {
  unassigned: { bg: 'bg-slate-500/15', text: 'text-slate-400' },
  assigned: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  in_progress: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  on_hold: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  completed: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  cancelled: { bg: 'bg-red-500/15', text: 'text-red-400' },
};

const priorityColors: Record<JobPriority, { bg: string; text: string }> = {
  low: { bg: 'bg-slate-500/15', text: 'text-slate-400' },
  medium: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  high: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  critical: { bg: 'bg-red-500/15', text: 'text-red-400' },
};

const roleColors: Record<UserRole, { bg: string; text: string }> = {
  admin: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
  dispatcher: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  technician: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
};

interface StatusBadgeProps {
  status: JobStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = statusColors[status];
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colors.bg, colors.text, className)}>
      {label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: JobPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const colors = priorityColors[priority];
  const label = priority.charAt(0).toUpperCase() + priority.slice(1);
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colors.bg, colors.text, className)}>
      {label}
    </span>
  );
}

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const colors = roleColors[role];
  const label = role.charAt(0).toUpperCase() + role.slice(1);
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colors.bg, colors.text, className)}>
      {label}
    </span>
  );
}

export const STATUS_COLORS = statusColors;
export const PRIORITY_COLORS = priorityColors;
