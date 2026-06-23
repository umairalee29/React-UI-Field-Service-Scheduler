import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Suspense } from 'react';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { DashboardClient } from './DashboardClient';
import Job from '@/models/Job';
import User from '@/models/User';
import type { IUser } from '@/types';

export interface TodayJob {
  _id: string;
  jobNumber: string;
  title: string;
  status: string;
  priority: string;
  scheduledAt: string;
  estimatedDuration: number;
  customer: { name: string };
  technician?: { name: string; avatar?: string } | null;
}

async function getDashboardData() {
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const [
    openJobs,
    inProgressToday,
    completedToday,
    criticalJobs,
    openJobsYesterday,
    inProgressYesterday,
    completedYesterday,
    criticalJobsYesterday,
    rawTechnicians,
    rawTodaysJobs,
  ] = await Promise.all([
    Job.countDocuments({ status: { $in: ['unassigned', 'assigned'] } }),
    Job.countDocuments({ status: 'in_progress', scheduledAt: { $gte: today, $lt: tomorrow } }),
    Job.countDocuments({ status: 'completed', updatedAt: { $gte: today, $lt: tomorrow } }),
    Job.countDocuments({ priority: 'critical', status: { $nin: ['completed', 'cancelled'] } }),
    Job.countDocuments({ status: { $in: ['unassigned', 'assigned'] }, createdAt: { $lt: today } }),
    Job.countDocuments({ status: 'in_progress', scheduledAt: { $gte: yesterday, $lt: today } }),
    Job.countDocuments({ status: 'completed', updatedAt: { $gte: yesterday, $lt: today } }),
    Job.countDocuments({ priority: 'critical', status: { $nin: ['completed', 'cancelled'] }, createdAt: { $lt: today } }),
    User.find({ role: 'technician', isActive: true }).select('-passwordHash').lean(),
    Job.find({ scheduledAt: { $gte: today, $lt: tomorrow }, status: { $ne: 'cancelled' } })
      .populate('technicianId', 'name avatar')
      .sort({ scheduledAt: 1 })
      .limit(8)
      .lean(),
  ]);

  const technicians = rawTechnicians as unknown as IUser[];

  // Serialize for the client component
  const todaysJobs: TodayJob[] = rawTodaysJobs.map((j) => {
    const tech = j.technicianId as unknown as { name: string; avatar?: string } | null;
    return {
      _id: j._id.toString(),
      jobNumber: j.jobNumber,
      title: j.title,
      status: j.status,
      priority: j.priority,
      scheduledAt: (j.scheduledAt as Date).toISOString(),
      estimatedDuration: j.estimatedDuration,
      customer: { name: j.customer.name },
      technician: tech ? { name: tech.name, avatar: tech.avatar } : null,
    };
  });

  return {
    openJobs,
    inProgressToday,
    completedToday,
    criticalJobs,
    openJobsTrend: openJobs - openJobsYesterday,
    inProgressTrend: inProgressToday - inProgressYesterday,
    completedTrend: completedToday - completedYesterday,
    criticalTrend: criticalJobs - criticalJobsYesterday,
    technicians,
    todaysJobs,
  };
}

export default async function DashboardPage() {
  await auth();
  const data = await getDashboardData();

  return (
    <Suspense fallback={<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>}>
      <DashboardClient {...data} />
    </Suspense>
  );
}
