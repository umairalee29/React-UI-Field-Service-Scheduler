import type { DefaultSession } from 'next-auth';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'dispatcher' | 'technician';

export type JobStatus =
  | 'unassigned'
  | 'assigned'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type JobPriority = 'low' | 'medium' | 'high' | 'critical';

export type JobType =
  | 'installation'
  | 'maintenance'
  | 'repair'
  | 'inspection'
  | 'emergency';

export type NotificationType =
  | 'job_assigned'
  | 'job_updated'
  | 'job_completed'
  | 'new_job'
  | 'system';

// ─── Domain Interfaces ────────────────────────────────────────────────────────

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isAvailable: boolean;
  isActive: boolean;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerAddress {
  street: string;
  city: string;
  postCode: string;
  country: string;
}

export interface ICustomer {
  name: string;
  phone: string;
  email: string;
  address: ICustomerAddress;
}

export interface IGeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IJob {
  _id: string;
  jobNumber: string;
  title: string;
  description: string;
  type: JobType;
  status: JobStatus;
  priority: JobPriority;
  technicianId?: string | IUser;
  createdBy: string | IUser;
  customer: ICustomer;
  location: IGeoPoint;
  scheduledAt: Date;
  estimatedDuration: number; // minutes
  actualDuration?: number;
  notes: string;
  completionNotes?: string;
  statusHistory?: string[] | IStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IStatusHistory {
  _id: string;
  jobId: string | IJob;
  status: JobStatus;
  changedBy: string | IUser;
  note: string;
  changedAt: Date;
}

export interface INotification {
  _id: string;
  userId: string | IUser;
  type: NotificationType;
  title: string;
  message: string;
  jobId?: string | IJob;
  read: boolean;
  createdAt: Date;
}

export interface ILocationPing {
  _id: string;
  technicianId: string | IUser;
  location: IGeoPoint;
  accuracy: number;
  recordedAt: Date;
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface JobsResponse {
  jobs: IJob[];
  total: number;
  counts: Record<JobStatus, number>;
}

export interface TechnicianWithMeta extends IUser {
  activeJobCount: number;
  latestLocation?: ILocationPing;
}

export interface AnalyticsOverview {
  totalJobs: number;
  jobsByStatus: Record<JobStatus, number>;
  jobsByPriority: Record<JobPriority, number>;
  avgCompletionTimeMinutes: number;
  completedThisWeek: number;
  completedLastWeek: number;
  topTechnicians: Array<{
    technician: Pick<IUser, '_id' | 'name' | 'avatar'>;
    completedCount: number;
  }>;
  dailyTrend: Array<{ date: string; created: number; completed: number }>;
}

// ─── Socket.io Event Payloads ─────────────────────────────────────────────────

export interface SocketJobPayload {
  job: IJob;
}

export interface SocketLocationPayload {
  technicianId: string;
  coordinates: [number, number];
  accuracy: number;
}

export interface SocketNotificationPayload {
  notification: INotification;
}

// ─── NextAuth Module Augmentation ─────────────────────────────────────────────

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: UserRole;
  }
}


// ─── UI / Form Types ──────────────────────────────────────────────────────────

export interface JobFilters {
  status?: JobStatus | '';
  priority?: JobPriority | '';
  technicianId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateJobFormData {
  title: string;
  description: string;
  type: JobType;
  priority: JobPriority;
  scheduledAt: string;
  estimatedDuration: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  street: string;
  city: string;
  postCode: string;
  country: string;
  longitude: number;
  latitude: number;
  technicianId?: string;
  notes?: string;
}
