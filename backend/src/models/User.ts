import mongoose, { Document, Schema } from 'mongoose';
import { UserRole } from '../types';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId?: mongoose.Types.ObjectId;
  employeeId?: mongoose.Types.ObjectId;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  refreshTokenVersion: number;
  lastLoginAt?: Date;
  mfaEnabled: boolean;
  mfaSecret?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  whatsappVerified: boolean;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  passwordChangedAt?: Date;
  whiteLabel?: { brandName?: string; logoUrl?: string; primaryColor?: string };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['super_admin', 'company_owner', 'company_admin', 'hr_manager', 'team_manager', 'employee'],
      required: true,
    },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    phone: String,
    avatarUrl: String,
    isActive: { type: Boolean, default: true },
    refreshTokenVersion: { type: Number, default: 0 },
    lastLoginAt: Date,
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, select: false },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    whatsappVerified: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
    passwordChangedAt: Date,
    whiteLabel: {
      brandName: String,
      logoUrl: String,
      primaryColor: String,
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ companyId: 1, role: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
