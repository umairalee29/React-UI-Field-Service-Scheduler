import mongoose, { Schema, type Document } from 'mongoose';

export interface ILocationPingDocument extends Document {
  technicianId: mongoose.Types.ObjectId;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  accuracy: number;
  recordedAt: Date;
}

const LocationPingSchema = new Schema<ILocationPingDocument>({
  technicianId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  accuracy: { type: Number, default: 10 },
  recordedAt: { type: Date, default: Date.now },
});

LocationPingSchema.index({ technicianId: 1 });
LocationPingSchema.index({ location: '2dsphere' });

const LocationPing = (
  mongoose.models['LocationPing'] ||
  mongoose.model<ILocationPingDocument>('LocationPing', LocationPingSchema)
) as mongoose.Model<ILocationPingDocument>;

export default LocationPing;
