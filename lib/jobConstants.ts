import type { JobPriority, JobStatus, JobType } from '@/types';

export const JOB_STATUSES: JobStatus[] = [
  'unassigned',
  'assigned',
  'in_progress',
  'on_hold',
  'completed',
  'cancelled',
];

export const STATUS_COLORS: Record<JobStatus, string> = {
  unassigned:  '#64748b',
  assigned:    '#3b82f6',
  in_progress: '#f59e0b',
  on_hold:     '#8b5cf6',
  completed:   '#10b981',
  cancelled:   '#ef4444',
};

export const STATUS_LABELS: Record<JobStatus, string> = {
  unassigned:  'Unassigned',
  assigned:    'Assigned',
  in_progress: 'In Progress',
  on_hold:     'On Hold',
  completed:   'Completed',
  cancelled:   'Cancelled',
};

export const EMPTY_MESSAGES: Record<JobStatus, string> = {
  unassigned:  'No unassigned jobs',
  assigned:    'No assigned jobs',
  in_progress: 'Nothing in progress',
  on_hold:     'Nothing on hold',
  completed:   'No completed jobs',
  cancelled:   'No cancelled jobs',
};

export const JOB_PRIORITIES: JobPriority[] = ['low', 'medium', 'high', 'critical'];

export const PRIORITY_COLORS: Record<JobPriority, string> = {
  low:      '#64748b',
  medium:   '#3b82f6',
  high:     '#f59e0b',
  critical: '#ef4444',
};

export const PRIORITY_LABELS: Record<JobPriority, string> = {
  low:      'Low',
  medium:   'Medium',
  high:     'High',
  critical: 'Critical',
};

export const JOB_TYPE_STYLES: Record<JobType, string> = {
  installation: 'bg-bg-card text-text-secondary',
  maintenance:  'bg-bg-card text-text-secondary',
  repair:       'bg-bg-card text-text-secondary',
  inspection:   'bg-bg-card text-text-secondary',
  emergency:    'bg-accent-red/10 text-accent-red',
};
