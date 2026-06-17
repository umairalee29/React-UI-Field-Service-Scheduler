import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { locationPingSchema } from '@/lib/validations';
import { emitToDispatchers } from '@/lib/socket';
import LocationPing from '@/models/LocationPing';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role === 'technician' && session.user.id !== params.id) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = locationPingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? 'Validation error' },
      { status: 400 }
    );
  }

  await connectDB();

  const { coordinates, accuracy } = parsed.data;

  const ping = await LocationPing.findOneAndUpdate(
    { technicianId: params.id },
    {
      technicianId: params.id,
      location: { type: 'Point', coordinates },
      accuracy,
      recordedAt: new Date(),
    },
    { upsert: true, new: true }
  ).lean();

  emitToDispatchers('location:update', {
    technicianId: params.id,
    coordinates,
    accuracy,
  });

  return NextResponse.json({ success: true, data: ping });
}
