import mongoose, { Document, Schema } from 'mongoose';

export interface ILoginHistory extends Document {
  userId: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  email: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  failureReason?: string;
  createdAt: Date;
}

const loginHistorySchema = new Schema<ILoginHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
    email: { type: String, required: true },
    success: { type: Boolean, required: true },
    ipAddress: String,
    userAgent: String,
    deviceId: String,
    failureReason: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

loginHistorySchema.index({ userId: 1, createdAt: -1 });

export const LoginHistory = mongoose.model<ILoginHistory>('LoginHistory', loginHistorySchema);
