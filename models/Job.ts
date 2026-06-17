import mongoose, { Schema, type Document, type Model } from 'mongoose';
import type { JobStatus, JobPriority, JobType } from '@/types';
import { getNextSequence } from './Counter';

export interface IJobDocument extends Document {
  jobNumber: string;
  title: string;
  description: string;
  type: JobType;
  status: JobStatus;
  priority: JobPriority;
  technicianId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: {
      street: string;
      city: string;
      postCode: string;
      country: string;
    };
  };
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  scheduledAt: Date;
  estimatedDuration: number;
  actualDuration?: number;
  notes: string;
  completionNotes?: string;
  statusHistory: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  isOverdue: boolean;
}

interface IJobModel extends Model<IJobDocument> {
  findNearby(coordinates: [number, number], radiusKm: number): Promise<IJobDocument[]>;
}

const JobSchema = new Schema<IJobDocument>(
  {
    jobNumber: { type: String, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['installation', 'maintenance', 'repair', 'inspection', 'emergency'],
      required: true,
    },
    status: {
      type: String,
      enum: ['unassigned', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled'],
      default: 'unassigned',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    technicianId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        postCode: { type: String, default: '' },
        country: { type: String, default: '' },
      },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [10.75, 59.91] },
    },
    scheduledAt: { type: Date, required: true },
    estimatedDuration: { type: Number, default: 60 },
    actualDuration: { type: Number },
    notes: { type: String, default: '' },
    completionNotes: { type: String },
    statusHistory: [{ type: Schema.Types.ObjectId, ref: 'StatusHistory' }],
  },
  { timestamps: true }
);

JobSchema.index({ technicianId: 1, status: 1 });
JobSchema.index({ scheduledAt: -1 });
JobSchema.index({ status: 1, priority: -1 });
JobSchema.index({ location: '2dsphere' });

JobSchema.virtual('isOverdue').get(function () {
  return (
    this.scheduledAt < new Date() &&
    this.status !== 'completed' &&
    this.status !== 'cancelled'
  );
});

JobSchema.pre('save', async function (next) {
  if (this.jobNumber) return next();
  const year = new Date().getFullYear();
  const seq = await getNextSequence(`job-${year}`);
  this.jobNumber = `JOB-${year}-${String(seq).padStart(5, '0')}`;
  next();
});

JobSchema.statics['findNearby'] = function (
  coordinates: [number, number],
  radiusKm: number
) {
  return this.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates },
        $maxDistance: radiusKm * 1000,
      },
    },
  });
};

const Job: IJobModel =
  (mongoose.models['Job'] as IJobModel) ||
  mongoose.model<IJobDocument, IJobModel>('Job', JobSchema);

export default Job;
