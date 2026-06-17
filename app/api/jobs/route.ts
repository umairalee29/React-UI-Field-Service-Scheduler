import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { createJobSchema } from '@/lib/validations';
import { emitJobCreated } from '@/lib/socket';
import Job from '@/models/Job';
import StatusHistory from '@/models/StatusHistory';
import type { JobStatus } from '@/types';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const technicianId = searchParams.get('technicianId');
  const search = searchParams.get('search');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (session.user.role === 'technician') {
    filter['technicianId'] = session.user.id;
  } else if (technicianId) {
    filter['technicianId'] = technicianId;
  }

  if (status) filter['status'] = status;
  if (priority) filter['priority'] = priority;
  if (search) {
    filter['$or'] = [
      { title: { $regex: search, $options: 'i' } },
      { jobNumber: { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
    ];
  }
  if (dateFrom || dateTo) {
    filter['scheduledAt'] = {};
    if (dateFrom) filter['scheduledAt']['$gte'] = new Date(dateFrom);
    if (dateTo) filter['scheduledAt']['$lte'] = new Date(dateTo);
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('technicianId', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ scheduledAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  const countFilter = session.user.role === 'technician'
    ? { technicianId: session.user.id }
    : {};

  const statusCounts = await Job.aggregate([
    { $match: countFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const counts: Record<string, number> = {
    unassigned: 0, assigned: 0, in_progress: 0, on_hold: 0, completed: 0, cancelled: 0,
  };
  for (const { _id, count } of statusCounts) {
    counts[_id as string] = count as number;
  }

  return NextResponse.json({
    success: true,
    data: { jobs, total, page, limit, counts },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!['admin', 'dispatcher'].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const body = await request.json();
  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? 'Validation error' },
      { status: 400 }
    );
  }

  const { customer, location, technicianId, notes, ...rest } = parsed.data;

  const job = await Job.create({
    ...rest,
    customer,
    location,
    technicianId: technicianId || undefined,
    status: technicianId ? 'assigned' : 'unassigned',
    notes: notes ?? '',
    createdBy: session.user.id,
  });

  if (job.status !== 'unassigned') {
    const history = await StatusHistory.create({
      jobId: job._id,
      status: job.status as JobStatus,
      changedBy: session.user.id,
      note: 'Job created and assigned',
      changedAt: new Date(),
    });
    job.statusHistory.push(history._id);
    await job.save();
  }

  const populated = await Job.findById(job._id)
    .populate('technicianId', 'name email avatar')
    .populate('createdBy', 'name email')
    .lean();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitJobCreated(populated as any);

  return NextResponse.json({ success: true, data: populated }, { status: 201 });
}
