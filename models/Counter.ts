import mongoose, { Schema } from 'mongoose';

const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter =
  (mongoose.models['Counter'] as mongoose.Model<{ _id: string; seq: number }>) ||
  mongoose.model<{ _id: string; seq: number }>('Counter', CounterSchema);

export async function getNextSequence(name: string): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return (counter as { seq: number } | null)?.seq ?? 1;
}

export default Counter;
