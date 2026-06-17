import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import User from '../models/User';
import Job from '../models/Job';
import StatusHistory from '../models/StatusHistory';
import Notification from '../models/Notification';
import LocationPing from '../models/LocationPing';
import Counter, { getNextSequence } from '../models/Counter';

// Load env manually since we're running outside Next.js
const MONGODB_URI = process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/dispatchiq';

async function seed() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('[Seed] Connected.');

  // Models are imported at the top of the file; connection is now established

  // Clear all collections
  console.log('[Seed] Clearing collections...');
  await Promise.all([
    User.deleteMany({}),
    Job.deleteMany({}),
    StatusHistory.deleteMany({}),
    Notification.deleteMany({}),
    LocationPing.deleteMany({}),
    Counter.deleteMany({}),
  ]);

  // ─── Users ───────────────────────────────────────────────────────────────────
  console.log('[Seed] Creating users...');

  const techSkills = [
    ['HVAC', 'Electrical'],
    ['Plumbing', 'Gas'],
    ['Electrical', 'Solar'],
    ['HVAC', 'Refrigeration'],
    ['Plumbing', 'Drainage'],
    ['Electrical', 'Security Systems'],
    ['Gas', 'Heating'],
    ['HVAC', 'Ventilation', 'Electrical'],
  ];

  const techNames = [
    'Erik Andersen', 'Lars Berg', 'Kari Nilsen', 'Ola Hansen',
    'Ingrid Dahl', 'Bjørn Eriksen', 'Silje Johnsen', 'Magnus Lund',
  ];

  // Pre-hash passwords — insertMany skips the pre-save bcrypt hook
  const [adminHash, dispatchHash, techHash] = await Promise.all([
    bcrypt.hash('admin1234', 10),
    bcrypt.hash('dispatch1234', 10),
    bcrypt.hash('tech1234', 10),
  ]);

  const usersData = [
    { name: 'Admin User', email: 'admin@dispatchiq.com', passwordHash: adminHash, role: 'admin', isAvailable: true },
    { name: 'Sara Dispatch', email: 'dispatch@dispatchiq.com', passwordHash: dispatchHash, role: 'dispatcher', isAvailable: true },
    { name: 'Johan Dispatch', email: 'dispatch2@dispatchiq.com', passwordHash: dispatchHash, role: 'dispatcher', isAvailable: true },
    ...techNames.map((name, i) => ({
      name,
      email: `tech${i + 1}@dispatchiq.com`,
      passwordHash: techHash,
      role: 'technician',
      isAvailable: Math.random() > 0.2,
      skills: techSkills[i] ?? [],
      phone: `+47 9${Math.floor(10000000 + Math.random() * 89999999)}`,
    })),
  ];

  const users = await User.insertMany(usersData);
  const adminUser = users.find((u) => u.role === 'admin')!;
  const dispatchers = users.filter((u) => u.role === 'dispatcher');
  const technicians = users.filter((u) => u.role === 'technician');

  console.log(`[Seed] Created ${users.length} users`);

  // ─── Jobs ─────────────────────────────────────────────────────────────────────
  console.log('[Seed] Creating jobs...');

  const jobTypes = ['installation', 'maintenance', 'repair', 'inspection', 'emergency'] as const;
  const priorities = ['low', 'medium', 'high', 'critical'] as const;
  const statuses = ['unassigned', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled'] as const;

  const osloCoords: Array<[number, number]> = [
    [10.7522, 59.9139], [10.7481, 59.9127], [10.7601, 59.9156],
    [10.7312, 59.9098], [10.7689, 59.9201], [10.7445, 59.9068],
    [10.7823, 59.9245], [10.7234, 59.9312], [10.7956, 59.9178],
    [10.7167, 59.8956], [10.8012, 59.9067], [10.7089, 59.9289],
    [10.8145, 59.9134], [10.7378, 59.8923], [10.7712, 59.9356],
    [10.6934, 59.9089], [10.7845, 59.8867], [10.7123, 59.9423],
    [10.7989, 59.9312], [10.6856, 59.9156], [10.7234, 59.8789],
    [10.8056, 59.9234], [10.7567, 59.8934], [10.6978, 59.9312],
    [10.7823, 59.9045], [10.7345, 59.9267], [10.8123, 59.9089],
    [10.7012, 59.8912], [10.7689, 59.9378], [10.6889, 59.9045],
  ];

  const customerFirstNames = ['Henrik', 'Anna', 'Per', 'Marit', 'Jon', 'Eva', 'Gunnar', 'Lise'];
  const customerLastNames = ['Hansen', 'Johansen', 'Olsen', 'Larsen', 'Andersen', 'Pedersen', 'Nilsen', 'Kristiansen'];
  const streets = ['Karl Johans gate', 'Storgata', 'Bogstadveien', 'Thorvald Meyers gate', 'Pilestredet'];
  const cities = ['Oslo', 'Bærum', 'Asker', 'Drammen', 'Lillestrøm'];

  const jobTitles: Record<string, string[]> = {
    installation: ['Heat Pump Installation', 'Solar Panel Installation', 'Security System Setup', 'HVAC Unit Install'],
    maintenance: ['Annual HVAC Service', 'Boiler Maintenance', 'Electrical Inspection', 'Plumbing Check'],
    repair: ['Burst Pipe Repair', 'AC Unit Repair', 'Electrical Fault Fix', 'Heating System Repair'],
    inspection: ['Gas Safety Inspection', 'Electrical Safety Check', 'Fire Suppression Audit', 'HVAC Assessment'],
    emergency: ['Gas Leak Emergency', 'Flooding Response', 'Power Failure', 'Heating Failure'],
  };

  const now = new Date();

  const jobsData = [];
  for (let i = 0; i < 60; i++) {
    const type = jobTypes[i % jobTypes.length]!;
    const priority = priorities[Math.floor(Math.random() * priorities.length)]!;
    const daysOffset = Math.floor(Math.random() * 37) - 30; // -30 to +7
    const scheduledAt = new Date(now);
    scheduledAt.setDate(scheduledAt.getDate() + daysOffset);
    scheduledAt.setHours(8 + Math.floor(Math.random() * 9), Math.random() > 0.5 ? 30 : 0, 0, 0);

    const coord = osloCoords[i % osloCoords.length]!;
    const firstName = customerFirstNames[Math.floor(Math.random() * customerFirstNames.length)]!;
    const lastName = customerLastNames[Math.floor(Math.random() * customerLastNames.length)]!;
    const street = streets[Math.floor(Math.random() * streets.length)]!;
    const city = cities[Math.floor(Math.random() * cities.length)]!;
    const titles = jobTitles[type] ?? ['Field Service Job'];
    const title = titles[Math.floor(Math.random() * titles.length)]!;

    const isAssigned = i < 40; // first 40 get assigned
    const tech = isAssigned ? technicians[i % technicians.length] : null;
    let status: typeof statuses[number];
    if (!isAssigned) {
      status = 'unassigned';
    } else if (daysOffset < -14) {
      status = Math.random() > 0.1 ? 'completed' : 'cancelled';
    } else if (daysOffset < -7) {
      status = Math.random() > 0.2 ? 'completed' : 'in_progress';
    } else if (daysOffset < 0) {
      status = ['assigned', 'in_progress', 'completed', 'on_hold'][Math.floor(Math.random() * 4)] as typeof statuses[number];
    } else {
      status = 'assigned';
    }

    const createdBy = dispatchers[Math.floor(Math.random() * dispatchers.length)] ?? adminUser;

    jobsData.push({
      title,
      description: `${title} at customer premises. Full service required.`,
      type,
      priority,
      status,
      technicianId: tech?._id ?? undefined,
      createdBy: createdBy._id,
      customer: {
        name: `${firstName} ${lastName}`,
        phone: `+47 9${Math.floor(10000000 + Math.random() * 89999999)}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.no`,
        address: {
          street: `${street} ${Math.floor(1 + Math.random() * 100)}`,
          city,
          postCode: `0${Math.floor(100 + Math.random() * 900)}`,
          country: 'Norway',
        },
      },
      location: { type: 'Point', coordinates: coord },
      scheduledAt,
      estimatedDuration: [60, 90, 120, 150, 180, 240][Math.floor(Math.random() * 6)]!,
      actualDuration: status === 'completed' ? 60 + Math.floor(Math.random() * 180) : undefined,
      notes: Math.random() > 0.5 ? 'Access via back entrance. Call ahead.' : '',
      completionNotes: status === 'completed' ? 'Job completed successfully. Customer satisfied.' : undefined,
    });
  }

  // insertMany skips pre-save hooks, so generate jobNumbers manually
  const year = new Date().getFullYear();
  for (const jobData of jobsData) {
    const seq = await getNextSequence(`job-${year}`);
    (jobData as Record<string, unknown>)['jobNumber'] = `JOB-${year}-${String(seq).padStart(5, '0')}`;
  }

  const jobs = await Job.insertMany(jobsData);
  console.log(`[Seed] Created ${jobs.length} jobs`);

  // ─── StatusHistory ─────────────────────────────────────────────────────────────
  console.log('[Seed] Creating status history...');

  const historyEntries = [];
  for (const job of jobs) {
    if (job.status === 'unassigned') continue;

    historyEntries.push({
      jobId: job._id,
      status: 'assigned',
      changedBy: dispatchers[0]!._id,
      note: `Assigned to technician`,
      changedAt: new Date(job.scheduledAt.getTime() - 24 * 60 * 60 * 1000),
    });

    if (['in_progress', 'completed', 'on_hold', 'cancelled'].includes(job.status)) {
      historyEntries.push({
        jobId: job._id,
        status: 'in_progress',
        changedBy: job.technicianId ?? dispatchers[0]!._id,
        note: 'Started work on site',
        changedAt: new Date(job.scheduledAt.getTime() + 30 * 60 * 1000),
      });
    }

    if (['completed', 'cancelled'].includes(job.status)) {
      historyEntries.push({
        jobId: job._id,
        status: job.status,
        changedBy: job.technicianId ?? dispatchers[0]!._id,
        note: job.status === 'completed' ? 'Job completed successfully' : 'Job cancelled',
        changedAt: new Date(
          job.scheduledAt.getTime() + (job.estimatedDuration ?? 60) * 60 * 1000
        ),
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const histories = await StatusHistory.insertMany(historyEntries as any[]);
  console.log(`[Seed] Created ${histories.length} status history entries`);

  // Link histories to jobs
  for (const history of histories) {
    await Job.findByIdAndUpdate(history.jobId, {
      $push: { statusHistory: history._id },
    });
  }

  // ─── LocationPings ─────────────────────────────────────────────────────────────
  console.log('[Seed] Creating location pings...');

  const pings = technicians.map((tech, i) => ({
    technicianId: tech._id,
    location: {
      type: 'Point',
      coordinates: osloCoords[i % osloCoords.length]!,
    },
    accuracy: 5 + Math.random() * 20,
    recordedAt: new Date(now.getTime() - Math.random() * 30 * 60 * 1000),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await LocationPing.insertMany(pings as any[]);
  console.log(`[Seed] Created ${pings.length} location pings`);

  // ─── Notifications ─────────────────────────────────────────────────────────────
  console.log('[Seed] Creating notifications...');

  const notifications = [];
  for (const tech of technicians) {
    const techJobs = jobs.filter(
      (j) => j.technicianId?.toString() === tech._id.toString()
    ).slice(0, 3);

    for (const job of techJobs) {
      notifications.push({
        userId: tech._id,
        type: 'job_assigned',
        title: 'New job assigned',
        message: `You have been assigned to ${job.jobNumber}: ${job.title}`,
        jobId: job._id,
        read: Math.random() > 0.4,
      });
    }
  }

  for (const d of dispatchers) {
    for (let i = 0; i < 3; i++) {
      const job = jobs[Math.floor(Math.random() * jobs.length)]!;
      notifications.push({
        userId: d._id,
        type: 'job_updated',
        title: 'Job status updated',
        message: `Job ${job.jobNumber} status changed to ${job.status.replace(/_/g, ' ')}`,
        jobId: job._id,
        read: Math.random() > 0.5,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await Notification.insertMany(notifications as any[]);
  console.log(`[Seed] Created ${notifications.length} notifications`);

  console.log('\n✅ Seed complete!');
  console.log('\nLogin credentials:');
  console.log('  Admin:      admin@dispatchiq.com     / admin1234');
  console.log('  Dispatcher: dispatch@dispatchiq.com  / dispatch1234');
  console.log('  Dispatcher: dispatch2@dispatchiq.com / dispatch1234');
  console.log('  Tech 1-8:   tech1@dispatchiq.com … tech8@dispatchiq.com / tech1234');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Fatal error:', err);
  process.exit(1);
});
