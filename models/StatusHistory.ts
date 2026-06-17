import mongoose, { Schema, type Document } from 'mongoose';
import type { JobStatus } from '@/types';

export interface IStatusHistoryDocument extends Document {
  jobId: mongoose.Types.ObjectId;
  status: JobStatus;
  changedBy: mongoose.Types.ObjectId;
  note: string;
  changedAt: Date;
}

const StatusHistorySchema = new Schema<IStatusHistoryDocument>({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  status: {
    type: String,
    enum: ['unassigned', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled'],
    required: true,
  },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: String, default: '' },
  changedAt: { type: Date, default: Date.now },
});

StatusHistorySchema.index({ jobId: 1 });

const StatusHistory = (
  mongoose.models['StatusHistory'] ||
  mongoose.model<IStatusHistoryDocument>('StatusHistory', StatusHistorySchema)
) as mongoose.Model<IStatusHistoryDocument>;

export default StatusHistory;
