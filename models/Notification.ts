import mongoose, { Schema, type Document } from 'mongoose';
import type { NotificationType } from '@/types';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  jobId?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['job_assigned', 'job_updated', 'job_completed', 'new_job', 'system'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

const Notification = (
  mongoose.models['Notification'] ||
  mongoose.model<INotificationDocument>('Notification', NotificationSchema)
) as mongoose.Model<INotificationDocument>;

export default Notification;
