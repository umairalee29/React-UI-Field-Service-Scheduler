import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const notifications = await Notification.find({ userId: session.user.id })
    .populate('jobId', 'jobNumber title')
    .sort({ read: 1, createdAt: -1 })
    .limit(50)
    .lean();

  const unreadCount = await Notification.countDocuments({
    userId: session.user.id,
    read: false,
  });

  return NextResponse.json({ success: true, data: { notifications, unreadCount } });
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  await Notification.updateMany({ userId: session.user.id, read: false }, { read: true });

  return NextResponse.json({ success: true });
}
