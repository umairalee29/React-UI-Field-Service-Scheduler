import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import StatusHistory from '@/models/StatusHistory';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!['admin', 'dispatcher'].includes(session.user.role)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const entries = await StatusHistory.find({})
    .sort({ changedAt: -1 })
    .limit(10)
    .populate('jobId', 'jobNumber title')
    .populate('changedBy', 'name')
    .lean();

  return NextResponse.json({ success: true, data: entries });
}
