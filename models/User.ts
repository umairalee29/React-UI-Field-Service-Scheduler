import mongoose, { Schema, type Document, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserRole } from '@/types';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone: string;
  avatar: string;
  isAvailable: boolean;
  isActive: boolean;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

interface IUserModel extends Model<IUserDocument> {
  findAvailableTechnicians(): Promise<IUserDocument[]>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'dispatcher', 'technician'], required: true },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    skills: [{ type: String }],
  },
  { timestamps: true }
);

UserSchema.index({ role: 1 });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

UserSchema.methods['comparePassword'] = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash as string);
};

UserSchema.statics['findAvailableTechnicians'] = function () {
  return this.find({ role: 'technician', isAvailable: true, isActive: true });
};

const User: IUserModel =
  (mongoose.models['User'] as IUserModel) ||
  mongoose.model<IUserDocument, IUserModel>('User', UserSchema);

export default User;
