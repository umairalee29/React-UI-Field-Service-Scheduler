import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Suspense } from 'react';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { DashboardClient } from './DashboardClient';
import Job from '@/models/Job';
import User from '@/models/User';
import type { IUser } from '@/types';

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
    // Yesterday comparisons
    openJobsYesterday,
    inProgressYesterday,
    completedYesterday,
    criticalJobsYesterday,
    rawTechnicians,
  ] = await Promise.all([
    // Today
    Job.countDocuments({ status: { $in: ['unassigned', 'assigned'] } }),
    Job.countDocuments({ status: 'in_progress', scheduledAt: { $gte: today, $lt: tomorrow } }),
    Job.countDocuments({ status: 'completed', updatedAt: { $gte: today, $lt: tomorrow } }),
    Job.countDocuments({ priority: 'critical', status: { $nin: ['completed', 'cancelled'] } }),
    // Yesterday — open jobs approximated as jobs created before today that are still open
    Job.countDocuments({ status: { $in: ['unassigned', 'assigned'] }, createdAt: { $lt: today } }),
    Job.countDocuments({ status: 'in_progress', scheduledAt: { $gte: yesterday, $lt: today } }),
    Job.countDocuments({ status: 'completed', updatedAt: { $gte: yesterday, $lt: today } }),
    Job.countDocuments({ priority: 'critical', status: { $nin: ['completed', 'cancelled'] }, createdAt: { $lt: today } }),
    User.find({ role: 'technician', isActive: true }).select('-passwordHash').lean(),
  ]);

  const technicians = rawTechnicians as unknown as IUser[];

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
