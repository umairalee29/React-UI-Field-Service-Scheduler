import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { updateStatusSchema } from '@/lib/validations';
import { emitJobStatusChanged, emitNotification } from '@/lib/socket';
import Job from '@/models/Job';
import StatusHistory from '@/models/StatusHistory';
import Notification from '@/models/Notification';
import User from '@/models/User';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? 'Validation error' },
      { status: 400 }
    );
  }

  await connectDB();

  const job = await Job.findById(params.id);
  if (!job) {
    return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
  }

  if (
    session.user.role === 'technician' &&
    job.technicianId?.toString() !== session.user.id
  ) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const { status, note, actualDuration, completionNotes } = parsed.data;

  job.status = status;
  if (actualDuration) job.actualDuration = actualDuration;
  if (completionNotes) job.completionNotes = completionNotes;
  await job.save();

  const history = await StatusHistory.create({
    jobId: job._id,
    status,
    changedBy: session.user.id,
    note: note ?? '',
    changedAt: new Date(),
  });
  job.statusHistory.push(history._id);
  await job.save();

  if (session.user.role === 'technician') {
    const dispatchers = await User.find({ role: { $in: ['admin', 'dispatcher'] }, isActive: true }, '_id');
    for (const d of dispatchers) {
      const notification = await Notification.create({
        userId: d._id,
        type: 'job_updated',
        title: 'Job status updated',
        message: `Job ${job.jobNumber} status changed to ${status.replace(/_/g, ' ')}`,
        jobId: job._id,
        read: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      emitNotification(d._id.toString(), notification.toObject() as any);
    }
  }

  if (
    session.user.role !== 'technician' &&
    job.technicianId &&
    status !== 'unassigned'
  ) {
    const notification = await Notification.create({
      userId: job.technicianId,
      type: 'job_updated',
      title: 'Your job was updated',
      message: `Job ${job.jobNumber} status changed to ${status.replace(/_/g, ' ')}`,
      jobId: job._id,
      read: false,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emitNotification(job.technicianId.toString(), notification.toObject() as any);
  }

  const populated = await Job.findById(job._id)
    .populate('technicianId', 'name email avatar')
    .populate('createdBy', 'name email')
    .lean();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitJobStatusChanged(populated as any);

  return NextResponse.json({ success: true, data: populated });
}
