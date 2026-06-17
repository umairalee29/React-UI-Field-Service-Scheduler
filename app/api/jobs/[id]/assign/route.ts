import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { assignJobSchema } from '@/lib/validations';
import { emitJobAssigned, emitNotification } from '@/lib/socket';
import { sendJobAssignedEmail } from '@/lib/mailer';
import Job from '@/models/Job';
import User from '@/models/User';
import StatusHistory from '@/models/StatusHistory';
import Notification from '@/models/Notification';

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

  const body = await request.json();
  const parsed = assignJobSchema.safeParse(body);
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

  const technician = await User.findOne({
    _id: parsed.data.technicianId,
    role: 'technician',
    isActive: true,
  });
  if (!technician) {
    return NextResponse.json({ success: false, error: 'Technician not found' }, { status: 404 });
  }

  job.technicianId = technician._id;
  job.status = 'assigned';
  await job.save();

  const history = await StatusHistory.create({
    jobId: job._id,
    status: 'assigned',
    changedBy: session.user.id,
    note: `Assigned to ${technician.name}`,
    changedAt: new Date(),
  });
  job.statusHistory.push(history._id);
  await job.save();

  const notification = await Notification.create({
    userId: technician._id,
    type: 'job_assigned',
    title: 'New job assigned',
    message: `You have been assigned to job ${job.jobNumber}: ${job.title}`,
    jobId: job._id,
    read: false,
  });

  const populated = await Job.findById(job._id)
    .populate('technicianId', 'name email avatar')
    .populate('createdBy', 'name email')
    .lean();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitJobAssigned(populated as any, technician._id.toString());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emitNotification(technician._id.toString(), notification.toObject() as any);

  sendJobAssignedEmail(
    { name: technician.name, email: technician.email },
    {
      _id: job._id.toString(),
      jobNumber: job.jobNumber,
      title: job.title,
      customer: job.customer,
      scheduledAt: job.scheduledAt,
      priority: job.priority,
    }
  ).catch(console.error);

  return NextResponse.json({ success: true, data: populated });
}
