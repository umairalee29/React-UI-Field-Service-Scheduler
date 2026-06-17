import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { updateUserSchema } from '@/lib/validations';
import User from '@/models/User';

export async function PATCH(
  request: Request,
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

  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? 'Validation error' },
      { status: 400 }
    );
  }

  const user = await User.findByIdAndUpdate(params.id, parsed.data, { new: true })
    .select('-passwordHash')
    .lean();

  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: user });
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
  if (params.id === session.user.id) {
    return NextResponse.json({ success: false, error: 'Cannot deactivate yourself' }, { status: 400 });
  }

  await connectDB();

  const user = await User.findByIdAndUpdate(params.id, { isActive: false }, { new: true })
    .select('-passwordHash')
    .lean();

  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: user });
}
