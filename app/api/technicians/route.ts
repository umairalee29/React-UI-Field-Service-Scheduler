import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Job from '@/models/Job';
import LocationPing from '@/models/LocationPing';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!['admin', 'dispatcher'].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const technicians = await User.find({ role: 'technician', isActive: true })
    .select('-passwordHash')
    .lean();

  const techIds = technicians.map((t) => t._id);

  const [jobCounts, latestPings] = await Promise.all([
    Job.aggregate([
      {
        $match: {
          technicianId: { $in: techIds },
          status: { $in: ['assigned', 'in_progress'] },
        },
      },
      { $group: { _id: '$technicianId', count: { $sum: 1 } } },
    ]),
    LocationPing.find({ technicianId: { $in: techIds } })
      .sort({ recordedAt: -1 })
      .lean()
      .then((pings) => {
        const seen = new Set<string>();
        return pings.filter((p) => {
          const id = p.technicianId.toString();
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
      }),
  ]);

  const jobCountMap = new Map(jobCounts.map((j: { _id: unknown; count: number }) => [j._id?.toString(), j.count]));
  const pingMap = new Map(latestPings.map((p) => [p.technicianId.toString(), p]));

  const result = technicians.map((t) => ({
    ...t,
    activeJobCount: jobCountMap.get(t._id.toString()) ?? 0,
    latestLocation: pingMap.get(t._id.toString()) ?? null,
  }));

  return NextResponse.json({ success: true, data: result });
}
