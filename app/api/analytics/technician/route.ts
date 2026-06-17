import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import Job from '@/models/Job';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!['admin', 'dispatcher'].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const technicianId = searchParams.get('technicianId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!technicianId) {
    return NextResponse.json({ success: false, error: 'technicianId required' }, { status: 400 });
  }

  await connectDB();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {
    technicianId: new mongoose.Types.ObjectId(technicianId),
  };
  if (startDate || endDate) {
    filter['scheduledAt'] = {};
    if (startDate) filter['scheduledAt']['$gte'] = new Date(startDate);
    if (endDate) filter['scheduledAt']['$lte'] = new Date(endDate);
  }

  const [stats, jobs] = await Promise.all([
    Job.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          avgDuration: { $avg: '$actualDuration' },
          onTime: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'completed'] },
                    { $lte: ['$updatedAt', '$scheduledAt'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    Job.find(filter)
      .sort({ scheduledAt: -1 })
      .limit(50)
      .populate('createdBy', 'name')
      .lean(),
  ]);

  const s = stats[0] ?? { total: 0, completed: 0, avgDuration: 0, onTime: 0 };
  const onTimeRate = s.completed > 0 ? Math.round((s.onTime / s.completed) * 100) : 0;

  return NextResponse.json({
    success: true,
    data: {
      totalAssigned: s.total,
      completed: s.completed,
      avgDurationMinutes: Math.round(s.avgDuration ?? 0),
      onTimeRate,
      jobs,
    },
  });
}
