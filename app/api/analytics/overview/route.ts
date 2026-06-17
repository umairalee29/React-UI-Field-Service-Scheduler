import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { startOfWeek, subWeeks, endOfWeek, subDays, startOfDay } from 'date-fns';
import Job from '@/models/Job';
import User from '@/models/User';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!['admin', 'dispatcher'].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const now = new Date();
  const thisWeekStart = startOfWeek(now);
  const thisWeekEnd = endOfWeek(now);
  const lastWeekStart = startOfWeek(subWeeks(now, 1));
  const lastWeekEnd = endOfWeek(subWeeks(now, 1));
  const thirtyDaysAgo = subDays(now, 30);

  const [
    jobsByStatus,
    jobsByPriority,
    avgCompletionAgg,
    completedThisWeek,
    completedLastWeek,
    topTechnicians,
    dailyTrend,
  ] = await Promise.all([
    Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Job.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Job.aggregate([
      { $match: { status: 'completed', actualDuration: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$actualDuration' } } },
    ]),
    Job.countDocuments({
      status: 'completed',
      updatedAt: { $gte: thisWeekStart, $lte: thisWeekEnd },
    }),
    Job.countDocuments({
      status: 'completed',
      updatedAt: { $gte: lastWeekStart, $lte: lastWeekEnd },
    }),
    Job.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$technicianId', completedCount: { $sum: 1 } } },
      { $sort: { completedCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'tech',
        },
      },
      { $unwind: '$tech' },
      {
        $project: {
          completedCount: 1,
          'tech._id': 1,
          'tech.name': 1,
          'tech.avatar': 1,
        },
      },
    ]),
    Job.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $facet: {
          created: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 },
              },
            },
          ],
          completed: [
            { $match: { status: 'completed' } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]),
  ]);

  const statusMap: Record<string, number> = {};
  for (const { _id, count } of jobsByStatus) statusMap[_id as string] = count as number;

  const priorityMap: Record<string, number> = {};
  for (const { _id, count } of jobsByPriority) priorityMap[_id as string] = count as number;

  const totalJobs = Object.values(statusMap).reduce((a, b) => a + b, 0);

  const trendData = dailyTrend[0] ?? { created: [], completed: [] };
  const createdMap = new Map((trendData.created as { _id: string; count: number }[]).map((d) => [d._id, d.count]));
  const completedMap = new Map((trendData.completed as { _id: string; count: number }[]).map((d) => [d._id, d.count]));

  const dailyArr = [];
  for (let i = 29; i >= 0; i--) {
    const d = startOfDay(subDays(now, i));
    const key = d.toISOString().slice(0, 10)!;
    dailyArr.push({
      date: key,
      created: createdMap.get(key) ?? 0,
      completed: completedMap.get(key) ?? 0,
    });
  }

  const totalTechnicians = await User.countDocuments({ role: 'technician', isActive: true });

  return NextResponse.json({
    success: true,
    data: {
      totalJobs,
      totalTechnicians,
      jobsByStatus: statusMap,
      jobsByPriority: priorityMap,
      avgCompletionTimeMinutes: avgCompletionAgg[0]?.avg ?? 0,
      completedThisWeek,
      completedLastWeek,
      topTechnicians: topTechnicians.map((t: { tech: unknown; completedCount: number }) => ({
        technician: t.tech,
        completedCount: t.completedCount,
      })),
      dailyTrend: dailyArr,
    },
  });
}
