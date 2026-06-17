import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Job from '@/models/Job';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const job = await Job.findById(params.id)
    .populate('technicianId', 'name email avatar phone skills')
    .populate('createdBy', 'name email avatar')
    .populate({
      path: 'statusHistory',
      populate: { path: 'changedBy', select: 'name email avatar' },
      options: { sort: { changedAt: 1 } },
    })
    .lean();

  if (!job) {
    return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
  }

  if (
    session.user.role === 'technician' &&
    job.technicianId?.toString() !== session.user.id
  ) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ success: true, data: job });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!['admin', 'dispatcher'].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const body = await request.json();
  const allowedFields = ['title', 'description', 'type', 'priority', 'scheduledAt',
    'estimatedDuration', 'notes', 'customer', 'location'];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  const job = await Job.findByIdAndUpdate(params.id, updates, { new: true })
    .populate('technicianId', 'name email avatar')
    .populate('createdBy', 'name email')
    .lean();

  if (!job) {
    return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: job });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });
  }

  await connectDB();

  const job = await Job.findByIdAndUpdate(
    params.id,
    { status: 'cancelled' },
    { new: true }
  ).lean();

  if (!job) {
    return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: job });
}
