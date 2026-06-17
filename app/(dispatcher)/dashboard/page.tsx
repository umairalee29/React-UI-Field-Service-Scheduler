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

  const [openJobs, inProgressToday, completedToday, criticalJobs, rawTechnicians] =
    await Promise.all([
      Job.countDocuments({ status: { $in: ['unassigned', 'assigned'] } }),
      Job.countDocuments({ status: 'in_progress', scheduledAt: { $gte: today, $lt: tomorrow } }),
      Job.countDocuments({ status: 'completed', updatedAt: { $gte: today, $lt: tomorrow } }),
      Job.countDocuments({ priority: 'critical', status: { $nin: ['completed', 'cancelled'] } }),
      User.find({ role: 'technician', isActive: true }).select('-passwordHash').lean(),
    ]);

  // _id is serialized to string via JSON when passed to client component
  const technicians = rawTechnicians as unknown as IUser[];

  return { openJobs, inProgressToday, completedToday, criticalJobs, technicians };
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
