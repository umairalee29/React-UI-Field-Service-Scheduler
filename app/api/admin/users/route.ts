import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { createUserSchema } from '@/lib/validations';
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

  const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 }).lean();
  return NextResponse.json({ success: true, data: users });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });
  }

  await connectDB();

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? 'Validation error' },
      { status: 400 }
    );
  }

  const { password, ...rest } = parsed.data;

  const existing = await User.findOne({ email: rest.email });
  if (existing) {
    return NextResponse.json({ success: false, error: 'Email already in use' }, { status: 409 });
  }

  const user = await User.create({
    ...rest,
    passwordHash: password,
  });

  const { passwordHash: _, ...safe } = user.toObject();
  return NextResponse.json({ success: true, data: safe }, { status: 201 });
}
