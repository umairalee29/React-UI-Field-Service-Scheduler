import { format, formatDistanceToNow } from 'date-fns';

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatScheduledAt(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy • h:mm a');
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'h:mm a');
}

export function formatJobNumber(year: number, seq: number): string {
  return `JOB-${year}-${String(seq).padStart(5, '0')}`;
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function priorityLabel(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function jobTypeLabel(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function formatAddress(address: {
  street: string;
  city: string;
  postCode: string;
  country: string;
}): string {
  return `${address.street}, ${address.city}, ${address.postCode}, ${address.country}`;
}
