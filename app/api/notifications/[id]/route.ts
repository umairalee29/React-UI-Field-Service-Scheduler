import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const notification = await Notification.findOneAndUpdate(
    { _id: params.id, userId: session.user.id },
    { read: true },
    { new: true }
  ).lean();

  if (!notification) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: notification });
}
